<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;
use App\Models\TareaFecha;
use App\Models\Lista;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Log; // ✅ Asegurar que `Log` está importado
use Illuminate\Support\Facades\DB;   // ⬅︎ asegúrate de tenerlo arriba del controlador


class TareaController extends Controller
{
    public function index() {
        //return Tarea::all();
        return Tarea::with('subtareas')->get(); // 🔹 Carga todas las subtareas
    }

    public function store(Request $request)
    {
        // 1) validación básica
        $data = $request->validate([
            // ya no pedimos 'user_id' en el payload
            'id'        => 'required|integer|unique:tasks,id',
            'title'     => 'required|string|max:255',
            'list_id'   => 'required|string|size:8',
            'padre'     => 'nullable|exists:tasks,id',
            'rutinario' => 'required|boolean',
            'progreso'  => 'required|integer',
        ]);

        $currentUser = Auth::id();

        // 2) buscar la lista y quién es su dueño
        $lista = Lista::where('id', $data['list_id'])->first();
        if (! $lista) {
            return response()->json(['error' => 'Lista no encontrada'], 404);
        }
        $ownerId = $lista->user_id;
        $soyDueno = ($ownerId === $currentUser);

        // 3) si no soy dueño, comprobar permiso "editar"
        if (! $soyDueno) {
            $tieneEditar = DB::table('permisos')
                ->where('lista_id',      $lista->id)
                ->where('lista_user_id', $ownerId)
                ->where('user_id',       $currentUser)
                ->where('permiso',       'editar')
                ->exists();
            if (! $tieneEditar) {
                return response()->json(['error' => 'No tienes permiso para crear tareas en esta lista'], 403);
            }
        }

        // 4) crear la tarea, **siempre apuntando al dueño de la lista** ($ownerId)
        try {
            $nueva = DB::transaction(function () use ($data, $ownerId) {
                $t = Tarea::create([
                    'id'        => $data['id'],
                    'title'     => $data['title'],
                    'list_id'   => $data['list_id'],
                    'user_id'   => $ownerId,     // <-- forzamos el owner aquí
                    'padre'     => $data['padre'] ?? null,
                    'rutinario' => $data['rutinario'],
                    'progreso'  => $data['progreso'],
                ]);

                // Si es subtarea, clonar asignaciones futuras de la tarea padre
                if ($t->padre) {
                    $hoy = now()->toDateString();
                    TareaFecha::where('tarea_id', $t->padre)
                        ->where('fecha', '>=', $hoy)
                        ->each(function ($f) use ($t) {
                            TareaFecha::create([
                                'tarea_id' => $t->id,
                                'user_id'  => $f->user_id,  // heredamos la columna user_id de la asignación padre
                                'fecha'    => $f->fecha,
                                'hora'     => $f->hora,
                                'progreso' => 0,
                            ]);
                        });
                }

                return $t;
            });

            return response()->json($nueva, 201);
        }
        catch (\Exception $e) {
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

        $desde  = $request->input('desde');
        $hasta  = $request->input('hasta');
        $userId = Auth::id();

        $tareasFechas = TareaFecha::with([
                // Cargamos la tarea (incluso soft-deleted) y sus subtareas,
                // sin volver a filtrar por user_id aquí:
                'tarea' => fn($q) => $q->withTrashed()->with('subtareas')
            ])
            ->where('user_id', $userId)  // solo las asignaciones de este colaborador
            ->whereRaw(
                "STR_TO_DATE(CONCAT(fecha, ' ', IFNULL(hora, '00:00:00')), '%Y-%m-%d %H:%i:%s') BETWEEN ? AND ?",
                [$desde, $hasta]
            )
            ->get()
            ->sortBy(fn($tf) => [ $tf->tarea->padre ?? 0, $tf->tarea_id ])
            ->values();

        return response()->json($tareasFechas);
    }




    /*
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
            // 1) Reconstruir la jerarquía de la tarea raíz
            $tareaRaiz = Tarea::raiz()
                ->with('lista')
                ->where('id', $row['tarea_id'])
                ->first();

            if (! $tareaRaiz) {
                return response()->json(['error' => 'La tarea no existe o no es raíz'], 422);
            }

            // 2) Determinar datos de la lista / dueño
            $listId  = $tareaRaiz->list_id;
            $duenoId = $tareaRaiz->user_id;
            $esDueno = ($duenoId === $userId);

            // 3) Verificar permiso “asignar” si no eres dueño
            if (! $esDueno) {
                $tieneAcceso = DB::table('permisos')
                    ->where('lista_id',      $listId)
                    ->where('lista_user_id', $duenoId)
                    ->where('user_id',       $userId)
                    ->whereIn('permiso',    ['asignar','editar'])
                    ->exists();

                if (! $tieneAcceso) {
                    return response()->json(['error' => 'No tienes permiso para asignar esta tarea'], 403);
                }
            }

            // 4) Obtener toda la jerarquía (raíz + subtareas)
            $todos = $tareaRaiz->descendientesRecursivos();

            // 5) Calcular el progreso “central” de la raíz (solo si no es rutinario)
            $progresoRaizCentral = $tareaRaiz->rutinario
                ? 0
                : $tareaRaiz->progreso;

            // 6) --- NUEVO: levantar los progresos ya existentes para esta fecha ---
            //     Esto devuelve un array asociativo [ tarea_id => progreso ]
            $progresosPorTarea = TareaFecha::where('fecha', $row['fecha'])
                ->pluck('progreso', 'tarea_id')
                ->toArray();
            // ----------------------------------------------------------------------

            // 7) Ahora sí: crear/actualizar cada asignación *para el usuario autenticado*
            foreach ($todos as $t) {
                // 7a) Si ya existía un progreso para esta tarea+fecha, lo usamos
                if (array_key_exists($t->id, $progresosPorTarea)) {
                    $progresoParaEsteNodo = $progresosPorTarea[$t->id];
                }
                else {
                    // 7b) Si NO existía, calculamos según tu lógica actual:
                    $esRaizYEsPuntual = ($t->id === $tareaRaiz->id) && ! $tareaRaiz->rutinario;
                    $progresoParaEsteNodo = $esRaizYEsPuntual
                        ? $progresoRaizCentral
                        : 0;
                }

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
    */





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

        // 1) Recuperar la tarea raíz (para obtener list_id y user_id del dueño)
        $raiz = Tarea::raiz()
            ->with('lista')
            ->where('id', $data['tarea_id'])
            ->first();

        if (! $raiz) {
            return response()->json(['error' => 'La tarea no existe o no es de primer nivel'], 422);
        }

        $listId  = $raiz->list_id;
        $duenoId = $raiz->user_id;
        $esDueno = ($duenoId === $userId);

        // 2) Si no soy dueño, verificar permiso "editar" o "asignar"
        if (! $esDueno) {
            $tienePermiso = DB::table('permisos')
                ->where('lista_id',      $listId)
                ->where('lista_user_id', $duenoId)
                ->where('user_id',       $userId)
                ->whereIn('permiso', ['editar', 'asignar'])
                ->exists();

            if (! $tienePermiso) {
                return response()->json(['error' => 'No tienes permiso para editar asignaciones'], 403);
            }
        }

        // 3) Obtener todos los descendientes (raíz + subtareas)
        $todos = $raiz->descendientesRecursivos();

        // 4) Si no vienen asignaciones, borrar todas las filas de este user
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

        // 5) Antes de crear/actualizar, levantamos TODOS los progresos existentes (de cualquier usuario)
        //    para las tareas en las fechas solicitadas.
        $fechasSolicitadas = collect($data['asignaciones'])->pluck('fecha')->unique()->toArray();
        $progresosExistentes = TareaFecha::whereIn('tarea_id', $todos->pluck('id')->toArray())
            ->whereIn('fecha', $fechasSolicitadas)
            ->get(['tarea_id', 'fecha', 'progreso'])
            ->groupBy('tarea_id')
            ->map(function($group) {
                return $group->pluck('progreso', 'fecha')->toArray();
            })
            ->toArray();
        // Ejemplo de $progresosExistentes:
        // [
        //   10 => [ '2025-06-02' => 50, '2025-06-03' => 20 ],
        //   11 => [ '2025-06-02' => 100 ],
        //   …
        // ]

        // 6) Ejecutamos todo dentro de una transacción
        DB::transaction(function () use ($todos, $data, $progresosExistentes, $raiz, $userId) {
            // 6-a) Primero, eliminar las fechas que el usuario ya no envió
            $nuevasFechas = collect($data['asignaciones'])->pluck('fecha')->toArray();

            foreach ($todos as $t) {
                $fechasExistentesTarea = TareaFecha::where('tarea_id', $t->id)
                                            ->where('user_id', $userId)
                                            ->pluck('fecha')
                                            ->toArray();
                foreach ($fechasExistentesTarea as $f) {
                    if (! in_array($f, $nuevasFechas)) {
                        TareaFecha::where('tarea_id', $t->id)
                                ->where('user_id', $userId)
                                ->where('fecha', $f)
                                ->delete();
                    }
                }
            }

            // Para comparar con “hoy”:
            $hoy = today()->toDateString();

            // 6-b) Ahora, por cada asignación nueva (fecha + hora) y para cada nodo:
            foreach ($data['asignaciones'] as $row) {
                $fecha = $row['fecha'];
                $hora  = $row['hora'];

                foreach ($todos as $t) {
                    // 6-c) Determinar el progreso inicial a usar:

                    //  1) Si ya existe un progreso en BD para esta tarea+fecha:
                    if (
                        isset($progresosExistentes[$t->id]) &&
                        array_key_exists($fecha, $progresosExistentes[$t->id])
                    ) {
                        $progresoParaEsteNodo = $progresosExistentes[$t->id][$fecha];
                    }
                    else {
                        //  2) No había ninguna fila previa -> aplicamos las reglas:
                        if (! $t->rutinario) {
                            // Tarea puntual: siempre uso su progreso “central”
                            $progresoParaEsteNodo = $t->progreso;
                        }
                        else {
                            // Tarea rutinaria:
                            if ($fecha === $hoy) {
                                // Si es para hoy: copiar el progreso actual
                                $progresoParaEsteNodo = $t->progreso;
                            } else {
                                // Cualquier fecha futura: empezar en 0
                                $progresoParaEsteNodo = 0;
                            }
                        }
                    }

                    // 6-d) Guardar/actualizar SOLO la fila de este usuario
                    TareaFecha::updateOrCreate(
                        [
                            'tarea_id' => $t->id,
                            'user_id'  => $userId,
                            'fecha'    => $fecha,
                        ],
                        [
                            'hora'     => ($hora === null || $hora === '--:--' || $hora === '') ? null : $hora,
                            'progreso' => $progresoParaEsteNodo,
                        ]
                    );

                    // 6-e) Sincronizar ese valor con todas las filas (cualquier user_id)
                    TareaFecha::where('tarea_id', $t->id)
                            ->where('fecha', $fecha)
                            ->update(['progreso' => $progresoParaEsteNodo]);
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