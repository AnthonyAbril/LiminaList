<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;
use App\Models\TareaFecha;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Log; // ✅ Asegurar que `Log` está importado
use Illuminate\Support\Facades\DB;   // ⬅︎ asegúrate de tenerlo arriba del controlador


class TareaController extends Controller
{
    public function index() {
        //return Tarea::all();
        return Tarea::with('subtareas')->get(); // 🔹 Carga todas las subtareas
    }

    public function store(Request $request) {

        try {
            // 1) validación ÚNICA
            $data = $request->validate([
                'id'        => 'required|integer|unique:tasks,id',
                'title'     => 'required|string|max:255',
                'list_id'   => 'required|string|size:8',
                'user_id'   => 'required|exists:users,id',
                'padre'     => 'nullable|exists:tasks,id',
                'rutinario' => 'required|boolean',
                'progreso'  => 'required|integer',
            ]);

            // 2) comprobar lista
            $existe = \App\Models\Lista::where('id',$data['list_id'])
                    ->where('user_id',$data['user_id'])->exists();
            if (!$existe) {
                return response()->json(['error'=>'La lista no existe para este usuario'],404);
            }

            // 3) operar
            $nueva = DB::transaction(function () use ($data) {

                /** A. crear tarea ---------------------------------- */
                $t = Tarea::create($data);

                /** B. si es subtarea ⇒ clonar asignaciones futuras -- */
                if ($t->padre) {
                    $hoy = now()->toDateString();

                    TareaFecha::where('tarea_id', $t->padre)
                        ->where('fecha','>=',$hoy)
                        ->each(function ($f) use ($t) {
                            TareaFecha::create([
                                'tarea_id' => $t->id,
                                'fecha'    => $f->fecha,
                                'hora'     => $f->hora,
                                'progreso' => 0,
                            ]);
                        });
                }
                return $t;        // <- devolver la nueva tarea
            });

            return response()->json($nueva,201);


        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id) {
        return Tarea::with('subtareas')->findOrFail($id);
        //return Tarea::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $tarea = Tarea::findOrFail($id);
        $tarea->update($request->all());
        return response()->json($tarea);
    }

    public function destroy($id)
    {
        $t = Tarea::with('subtareas')->findOrFail($id);
        $todas = $t->descendientesRecursivos(); // 👈 si ya tienes esta función
        $todas->push($t); // incluye la raíz también


        DB::transaction(function () use ($todas, $t) {
            $hoy = now()->toDateString();

            // 🔥 borrar asignaciones futuras de todas las tareas (raíz + subtareas)
            foreach ($todas as $tt) {
                TareaFecha::where('tarea_id', $tt->id)
                        ->where('fecha', '>=', $hoy)
                        ->delete();
            }

            // 🔥 borrar todas las tareas (eliminar primero subtareas si no tienes onDeleteCascade)
            foreach ($todas as $tt) {
                $tt->delete();
            }
        });


        return response()->json(['ok' => true]);
    }

    public function eventosPorFecha(Request $request)
    {
        $fecha  = $request->validate(['fecha' => 'required|date'])['fecha'];
        $userId = Auth::id();
        $hoy    = today()->toDateString();

        // 1) sincroniza regresivamente solo las filas que *este usuario* tenga para hoy
        if ($fecha === $hoy) {
            TareaFecha::where('fecha', $hoy)
                ->where('user_id', $userId)
                ->get()
                ->filter(fn($tf) => $tf->tarea->rutinario)
                ->each(fn($tf) => $tf->tarea->update(['progreso' => $tf->progreso]));
        }

        // 2) traemos solo las filas de este usuario, sin volver a exigir que sea dueño de la tarea
        $tareasFechas = TareaFecha::with([
                'tarea' => fn($q) => $q->withTrashed()->with('subtareas')
            ])
            ->whereDate('fecha', $fecha)
            ->where('user_id', $userId)
            ->get()
            ->sortBy(fn($tf) => [ $tf->tarea->padre ?? 0, $tf->tarea_id ])
            ->values();

        return response()->json($tareasFechas);
    }


    public function eventosProximos(Request $request)
    {
        $request->validate([
            'desde' => 'required|date',
            'hasta' => 'required|date|after_or_equal:desde',
        ]);

        $desde = $request->input('desde');
        $hasta = $request->input('hasta');
        $userId = Auth::id();

        $tareasFechas = TareaFecha::with([
            'tarea' => function ($q) use ($userId) {
                $q->withTrashed()
                ->with('subtareas')
                ->where('user_id', $userId);
            }
        ])
        ->where('user_id', $userId)
        ->whereHas('tarea', fn($q) => $q->where('user_id', $userId))
        ->whereRaw("STR_TO_DATE(CONCAT(fecha, ' ', hora), '%Y-%m-%d %H:%i:%s') BETWEEN ? AND ?", [$desde, $hasta])
        ->get();

        return response()->json($tareasFechas);
    }




    public function asignarTareaFechas(Request $request)
    {
        $data = $request->validate([
            'tareasFechas'            => 'required|array',
            'tareasFechas.*.tarea_id' => 'required|exists:tasks,id',
            'tareasFechas.*.fecha'    => 'required|date',
            'tareasFechas.*.hora'     => 'nullable|date_format:H:i',
        ]);

        $userId = Auth::id();

        foreach ($data['tareasFechas'] as $row) {
            $tareaRaiz = Tarea::raiz()
                ->with('lista')                 // para traer list_id y user_id del dueño
                ->where('id', $row['tarea_id'])
                ->first();

            if (! $tareaRaiz) {
                return response()->json(['error' => 'La tarea no existe o no es raíz'], 422);
            }

            // Determinar datos de la lista / dueño:
            $listId     = $tareaRaiz->list_id;   // id de la lista
            $duenoId    = $tareaRaiz->user_id;   // user_id del dueño
            $esDueno    = ($duenoId === $userId);

            // 1️⃣ Si no es dueño, revisar permiso “asignar” en la tabla permisos:
            if (! $esDueno) {
                $tieneAsignar = DB::table('permisos')
                    ->where('lista_id', $listId)
                    ->where('lista_user_id', $duenoId)
                    ->where('user_id', $userId)
                    ->where('permiso', 'asignar')
                    ->exists();

                if (! $tieneAsignar) {
                    return response()->json(['error' => 'No tienes permiso para asignar esta tarea'], 403);
                }
            }

            // 2️⃣ Ahora sí: obtenemos la jerarquía completa (raíz + subtareas)
            $todos = $tareaRaiz->descendientesRecursivos();

            // 3️⃣ Calcular progreso inicial de la raíz:
            $progresoRaiz = $tareaRaiz->rutinario
                ? 0
                : $tareaRaiz->progreso;

            // 4️⃣ Crear/actualizar each asignación *para el usuario autenticado*
            foreach ($todos as $t) {
                $esRaizYEsPuntual = ($t->id === $tareaRaiz->id) && ! $tareaRaiz->rutinario;
                $progresoParaEsteNodo = $esRaizYEsPuntual
                    ? $progresoRaiz
                    : 0;

                TareaFecha::updateOrCreate(
                    [
                        'tarea_id' => $t->id,
                        'user_id'  => $userId,
                        'fecha'    => $row['fecha'],
                    ],
                    [
                        'hora'     => $row['hora'],
                        'progreso' => $progresoParaEsteNodo,
                    ]
                );
            }
        }

        return response()->json(['message' => 'Asignaciones guardadas'], 201);
    }





    public function getAsignaciones($tareaId)
    {
        $userId = Auth::id();

        $asignaciones = TareaFecha::where('tarea_id', $tareaId)
            ->where('user_id', $userId)
            ->get(['fecha', 'hora']);
        return response()->json($asignaciones);
    }

    public function editarAsignaciones(Request $request)
    {
        $data = $request->validate([
            'tarea_id'      => 'required|exists:tasks,id',
            'asignaciones'  => 'nullable|array',
            'asignaciones.*.fecha' => 'required|date',
            'asignaciones.*.hora'  => 'nullable|date_format:H:i',
        ]);

        $userId = Auth::id();

        // 1) Recuperar la tarea raíz (sin filtrar por user_id), para tener list_id y user_id (dueño)
        $raiz = Tarea::raiz()
            ->with('lista')
            ->where('id', $data['tarea_id'])
            ->first();

        if (! $raiz) {
            return response()->json(['error' => 'La tarea no existe o no es de primer nivel'], 422);
        }

        $listId  = $raiz->list_id;    // id de la lista
        $duenoId = $raiz->user_id;    // user_id del dueño
        $esDueno = ($duenoId === $userId);

        // 2) Si no es dueño, verificar permiso "editar" o "asignar" en la tabla permisos:
        if (! $esDueno) {
            $tienePermiso = DB::table('permisos')
                ->where('lista_id', $listId)
                ->where('lista_user_id', $duenoId)
                ->where('user_id', $userId)
                ->whereIn('permiso', ['editar', 'asignar'])
                ->exists();

            if (! $tienePermiso) {
                return response()->json(['error' => 'No tienes permiso para editar asignaciones'], 403);
            }
        }

        // 3) Obtener todos los descendientes (si la tarea es raíz de hecho)
        $todos = $raiz->descendientesRecursivos();

        // 4) Si el array 'asignaciones' llega vacío, borrar todas las filas
        if (empty($data['asignaciones'])) {
            DB::transaction(function () use ($todos, $userId) {
                foreach ($todos as $t) {
                    TareaFecha::where('tarea_id', $t->id)
                            ->where('user_id', $userId)
                            ->delete();
                }
            });
            return response()->json(['message' => 'Todas las asignaciones eliminadas'], 200);
        }

        $nuevas = collect($data['asignaciones']);

        DB::transaction(function () use ($todos, $nuevas, $raiz, $userId) {
            // 4-a) Calcular progreso inicial de la raíz puntual
            $progresoRaiz = $raiz->rutinario ? 0 : $raiz->progreso;

            // 4-b) Limpiar fechas que ya no vienen en $nuevas (solo para este user_id)
            foreach ($todos as $t) {
                $fechasExistentes = TareaFecha::where('tarea_id', $t->id)
                                            ->where('user_id', $userId)
                                            ->pluck('fecha');
                foreach ($fechasExistentes as $f) {
                    if (! $nuevas->contains('fecha', $f)) {
                        TareaFecha::where('tarea_id', $t->id)
                                ->where('fecha', $f)
                                ->where('user_id', $userId)
                                ->delete();
                    }
                }
            }

            // 4-c) Crear o actualizar cada asignación nueva para cada nodo
            foreach ($nuevas as $row) {
                foreach ($todos as $t) {
                    $esRaizYEsPuntual = ($t->id === $raiz->id) && ! $raiz->rutinario;
                    $progresoParaEsteNodo = $esRaizYEsPuntual
                        ? $progresoRaiz
                        : 0;

                    TareaFecha::updateOrCreate(
                        [
                            'tarea_id' => $t->id,
                            'user_id'  => $userId,
                            'fecha'    => $row['fecha'],
                        ],
                        [
                            'hora'     => ($row['hora'] === null || $row['hora'] === '--:--' || $row['hora'] === '')
                                        ? null
                                        : $row['hora'],
                            'progreso' => $progresoParaEsteNodo,
                        ]
                    );
                }
            }
        });

        return response()->json(['message' => 'Asignaciones actualizadas correctamente'], 200);
    }



    public function editarProgreso(Request $request)
    {
        \Log::info('EDITAR PROGRESO recibo:', $request->all());
        $data = $request->validate([
            'tarea_id' => 'required|exists:tasks,id',
            'progreso' => 'required|integer|min:0|max:100',
            'fecha'    => 'nullable|date',
        ]);

        $tarea = Tarea::findOrFail($data['tarea_id']);
        $p     = $data['progreso'];
        $fecha = $data['fecha'] ?? null;       // null => edición “de hoy”
        $hoy   = today()->toDateString();
        $userId = Auth::id();

        DB::transaction(function () use ($tarea, $p, $fecha, $hoy, $userId) {

            // ———— 1) edición desde lista diaria ————
            if ($fecha) {
                // 1.1) Actualizar SOLO esa fila de *este usuario*
                TareaFecha::updateOrCreate(
                    [
                        'tarea_id' => $tarea->id,
                        'user_id'  => $userId,
                        'fecha'    => $fecha
                    ],
                    ['progreso' => $p]
                );

                // 1.2) Sincronizar, para que TODOS los usuarios que tengan
                // la misma tarea+fecha vean el mismo progreso
                TareaFecha::where('tarea_id', $tarea->id)
                    ->where('fecha', $fecha)
                    ->update(['progreso' => $p]);

                if (! $tarea->rutinario) {
                    // puntual: sincronizar “central” + FUTURAS filas (todas las user_id)
                    $tarea->update(['progreso' => $p]);
                    TareaFecha::where('tarea_id', $tarea->id)
                        ->where('fecha', '>=', $hoy)
                        ->update(['progreso' => $p]);
                }
                elseif ($fecha === $hoy) {
                    // rutinaria, pero para hoy: solo sincroniza “central”
                    $tarea->update(['progreso' => $p]);
                }
                // rutinaria FUTURA: no tocamos nada más
                return;
            }

            // ———— 2) edición “por lista individual” (fecha = null => HOY) ————
            $tarea->update(['progreso' => $p]);

            // 2.1) Si ya tenía asignación para hoy, la actualizamos; si no, la creamos
            TareaFecha::updateOrCreate(
                [
                    'tarea_id' => $tarea->id,
                    'user_id'  => $userId,
                    'fecha'    => $hoy
                ],
                ['progreso' => $p]
            );

            // 2.2) Sincronizar progreso para que TODOS los usuarios vean el mismo valor
            TareaFecha::where('tarea_id', $tarea->id)
                ->where('fecha', $hoy)
                ->update(['progreso' => $p]);

            if (! $tarea->rutinario) {
                // puntual: además propagamos a FUTURAS filas para todos los usuarios
                TareaFecha::where('tarea_id', $tarea->id)
                    ->where('fecha', '>=', $hoy)
                    ->update(['progreso' => $p]);
            }
            // rutinaria: nunca tocamos futuras
        });

        return response()->json(['ok' => true]);
    }



    




    public function obtenerHistorialProgreso($tareaId)
    {
        $historial = TareaFecha::where('tarea_id', $tareaId)
            ->where('fecha', '<', now()->toDateString())
            ->orderBy('fecha', 'desc')
            ->get(['fecha', 'progreso']);

        return response()->json($historial);
    }

    // en TareaController.php
    public function historialProgresoGeneral($tareaId = null)
    {
        $userId = Auth::id();

        $query = TareaFecha::with('tarea')
            ->whereIn('tarea_id', function($q) use($userId, $tareaId){
                $q->select('id')->from('tasks')
                ->where('user_id', $userId)
                ->when($tareaId, fn($q) => $q->where('padre', $tareaId))
                ->when(!$tareaId, fn($q) => $q->whereNull('padre'));
            })
            ->orderBy('fecha');

        $rows = $query->get();

        $grouped = $rows->groupBy('fecha')->map(fn($dayRows, $fecha) => [
            'fecha'  => $fecha,
            'tareas' => $dayRows->map(fn($tf) => [
                'id'       => $tf->tarea->id,
                'titulo'   => $tf->tarea->title,
                'progreso' => $tf->progreso,
            ])->values(),
        ])->values();

        return response()->json($grouped);
    }


    
}