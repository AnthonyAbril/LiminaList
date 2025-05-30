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

    public function eventosProximos(Request $request)
    {
        $request->validate([
            'desde' => 'required|date',
            'hasta' => 'required|date|after_or_equal:desde',
        ]);

        $desde = $request->input('desde');
        $hasta = $request->input('hasta');

        $tareasFechas = TareaFecha::with([
            'tarea' => function ($q) {
                $q->withTrashed()        // 👈  añade esto
                    ->with('subtareas');   //     y sigue cargando subtareas
            }
        ])
        ->whereRaw("STR_TO_DATE(CONCAT(fecha, ' ', hora), '%Y-%m-%d %H:%i:%s') BETWEEN ? AND ?", [$desde, $hasta])
        ->get();

        return response()->json($tareasFechas);
    }

    public function eventosPorFecha(Request $request)
    {
        $fecha = $request->validate(['fecha' => 'required|date'])['fecha'];
        $hoy   = today()->toDateString();

        // 1) sincroniza regresivamente
        if ($fecha === $hoy) {
            TareaFecha::with('tarea')
                ->where('fecha', $hoy)
                ->get()
                ->filter(fn($tf) => $tf->tarea->rutinario)
                ->each(fn($tf) => $tf->tarea->update(['progreso' => $tf->progreso]));
        }

        // 2) trae todo sin orden en SQL
        $tareasFechas = TareaFecha::with(['tarea' => fn($q) => $q->withTrashed()->with('subtareas')])
            ->whereDate('fecha', $fecha)
            ->get();

        // 3) ordena en PHP por [padre, tarea_id]
        $tareasFechas = $tareasFechas->filter(fn($tf) => $tf->tarea !== null)
        ->sortBy(fn($tf) => [ $tf->tarea->padre ?? 0, $tf->tarea_id ])
        ->values();

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

        foreach ($data['tareasFechas'] as $row) {

            /** 1️⃣ Confirmo que es raíz */
            $tareaRaiz = Tarea::raiz()->find($row['tarea_id']);
            if (!$tareaRaiz) {
                return response()->json(['error'=>'Solo tareas raíz'], 422);
            }

            /** 2️⃣ Construyo la lista de la raíz + TODAS sus subtareas */
            $todas = $tareaRaiz->descendientesRecursivos();

            /** 3️⃣ Creo/actualizo una fila por cada una */
            foreach ($todas as $t) {
                TareaFecha::updateOrCreate(
                    ['tarea_id' => $t->id, 'fecha' => $row['fecha']],
                    ['hora' => $row['hora'], 'progreso' => 0]
                );
            }
        }
        return response()->json(['message' => 'Asignaciones guardadas'], 201);
    }



    public function getAsignaciones($tareaId)
    {
        $asignaciones = TareaFecha::where('tarea_id', $tareaId)->get(['fecha', 'hora']);
        return response()->json($asignaciones);
    }

    public function editarAsignaciones(Request $request)
    {
        /** 1. Validación básica */
        $data = $request->validate([
            'tarea_id'      => 'required|exists:tasks,id',
            'asignaciones'  => 'nullable|array',
            'asignaciones.*.fecha' => 'required|date',
            'asignaciones.*.hora'  => 'nullable|date_format:H:i',
        ]);

        /** 2. Comprobar que la tarea es raíz */
        $raiz = Tarea::raiz()->with('subtareas.subtareas')->find($data['tarea_id']);
        if (! $raiz) {
            return response()->json(['error' => 'Solo tareas de primer nivel pueden editarse'], 422);
        }

        /** 3. Colección con la raíz + TODOS los descendientes */
        $todos = $raiz->descendientesRecursivos();        // collection única

        /** 4. Si el array está vacío ⇒ eliminar TODAS las asignaciones de todos los nodos */
        if (empty($data['asignaciones'])) {
            DB::transaction(function () use ($todos) {
                $todos->each(fn ($t) => $t->fechas()->delete());
            });
            return response()->json(['message' => 'Todas las asignaciones eliminadas'], 200);
        }

        /** 5. Convertir a collection para búsquedas rápidas */
        $nuevas = collect($data['asignaciones']);   // cada elem: ['fecha'=>…, 'hora'=>…]

        /** 6. Operaciones atómicas */
        DB::transaction(function () use ($todos, $nuevas) {

            /** 6-a. Limpiar fechas que ya no están */
            $todos->each(function ($t) use ($nuevas) {
                $t->fechas                       // pluck fechas existentes de ese nodo
                ->pluck('fecha')
                ->each(function ($f) use ($t, $nuevas) {
                    if (! $nuevas->contains('fecha', $f)) {
                        $t->fechas()->where('fecha', $f)->delete();
                    }
                });
            });

            /** 6-b. Crear / actualizar todas las nuevas fechas para cada nodo */
            $nuevas->each(function ($row) use ($todos) {
                $todos->each(function ($t) use ($row) {
                    TareaFecha::updateOrCreate(
                        ['tarea_id' => $t->id, 'fecha' => $row['fecha']],
                        [
                            'hora' => ($row['hora'] === null || $row['hora'] === '--:--' || $row['hora'] === '') ? null : $row['hora']
                        ]
                    );
                });
            });
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
        $fecha = $data['fecha'] ?? null;            // null ⇒ edición desde lista individual (hoy)
        $hoy   = today()->toDateString();

        DB::transaction(function () use ($tarea, $p, $fecha, $hoy) {

            // ———— 1) edición desde lista diaria ————
            if ($fecha) {
                // 1.1) Actualiza SOLO esa fila de TareaFecha
                TareaFecha::updateOrCreate(
                    ['tarea_id' => $tarea->id, 'fecha' => $fecha],
                    ['progreso' => $p]
                );

                if (! $tarea->rutinario) {
                    // ——— puntual: sincroniza central + futuras ———
                    $tarea->update(['progreso' => $p]);
                    TareaFecha::where('tarea_id', $tarea->id)
                        ->where('fecha', '>=', $hoy)
                        ->update(['progreso' => $p]);
                }
                elseif ($fecha === $hoy) {
                    // ——— rutinaria, pero SONDE hoy: solo sincroniza central ———
                    $tarea->update(['progreso' => $p]);
                }

                // en rutinaria FUTURA no tocamos nada más
                return;
            }

            // ———— 2) edición desde lista individual (fecha = null ⇒ hoy) ————
            $tarea->update(['progreso' => $p]);

            // si existe asignación para hoy, la actualizamos
            TareaFecha::updateOrCreate(
                ['tarea_id' => $tarea->id, 'fecha' => $hoy],
                ['progreso' => $p]
            );

            if (! $tarea->rutinario) {
                // puntual: además propagamos a futuras
                TareaFecha::where('tarea_id', $tarea->id)
                    ->where('fecha', '>=', $hoy)
                    ->update(['progreso' => $p]);
            }
            // rutina: nunca tocamos futuras
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