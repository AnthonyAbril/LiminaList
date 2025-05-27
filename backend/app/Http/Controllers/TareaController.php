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
            $validatedData = $request->validate([
                'id' => 'required|integer|unique:tasks,id',
                'title' => 'required|string|max:255',
                'list_id' => 'required|string|size:8',
                'user_id' => 'required|exists:users,id',
                'padre' => 'nullable|integer|exists:tasks,id',
                'rutinario' => 'required|boolean',
                'progreso' => 'required|integer',

                'fechas' => 'sometimes|array', // ✅ Validación de array
                'fechas.*.fecha' => 'required|date',
                'fechas.*.hora' => 'required|date_format:H:i:s'
            ]);


            // 🔹 Verificar si la lista existe
            if (!\App\Models\Lista::where('id', $validatedData['list_id'])->where('user_id', $validatedData['user_id'])->exists()) {
                return response()->json(['error' => 'La lista no existe para este usuario'], 404);
            }

            // 🔹 Crear la tarea
            $tarea = Tarea::create($validatedData);
            return response()->json($tarea, 201);

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

    public function destroy($id) {
        $tarea = Tarea::findOrFail($id);
        $tarea->delete();

        return response()->json(['message' => 'Tarea eliminada'], 200);
    }

    public function eventosProximos(Request $request)
    {
        $request->validate([
            'desde' => 'required|date',
            'hasta' => 'required|date|after_or_equal:desde',
        ]);

        $desde = $request->input('desde');
        $hasta = $request->input('hasta');

        $tareasFechas = TareaFecha::with(['tarea' => function ($query) {
            $query->with('subtareas'); // ✅ Cargar subtareas dentro de cada tarea
        }])
        ->whereRaw("STR_TO_DATE(CONCAT(fecha, ' ', hora), '%Y-%m-%d %H:%i:%s') BETWEEN ? AND ?", [$desde, $hasta])
        ->get();

        return response()->json($tareasFechas);
    }

    public function eventosPorFecha(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
        ]);

        $fecha = $request->input('fecha');

        $tareasFechas = TareaFecha::with(['tarea' => function ($query) {
            $query->with('subtareas'); // ✅ Incluir subtareas
        }])
        ->whereDate('fecha', $fecha)
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
                        ['hora' => $row['hora'] ?: null]        // mantén progreso tal cual
                    );
                });
            });
        });

        return response()->json(['message' => 'Asignaciones actualizadas correctamente'], 200);
    }

    public function editarProgreso(Request $request)
    {
        /* 1️⃣  Validación */
        $data = $request->validate([
            'tarea_id' => 'required|exists:tasks,id',
            'progreso' => 'required|integer|min:0|max:100',
            'fecha'    => 'nullable|date',   // null  ⇒  lista individual
        ]);

        /* 2️⃣  Cargamos la tarea con toda la jerarquía (para usar descendientes) */
        $tarea = Tarea::with('subtareas.subtareas')->findOrFail($data['tarea_id']);

        /* 3️⃣  Transacción */
        DB::transaction(function () use ($tarea, $data) {

            $progreso = $data['progreso'];
            $hoy      = now()->toDateString();

            /* ──────────────  A) Cambio desde lista diaria  ───────────── */
            if (!empty($data['fecha'])) {

                $fila = TareaFecha::where('tarea_id', $tarea->id)
                                ->where('fecha',   $data['fecha'])
                                ->first();

                if (!$fila) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'fecha' => 'No existe asignación para esa fecha.',
                    ]);
                }

                $fila->progreso = $progreso;
                $fila->save();                 // ✔️  solo esa fila
                return;                        //   Fin caso A
            }

            /* ──────────────  B) Cambio desde lista individual ───────────── */
            //  B-1  Actualizamos progreso en tasks (raíz + descendientes)
            $todos = $tarea->descendientesRecursivos();   // incluye la raíz

            foreach ($todos as $nodo) {
                $nodo->progreso = $progreso;
                $nodo->save();
            }

            //  B-2  Sincronizamos asignaciones FUTURAS **solo** de los nodos puntuales
            $todos->filter(fn ($n) => !$n->rutinario)     // descarta los rutinarios
                ->each(function ($n) use ($progreso, $hoy) {
                    TareaFecha::where('tarea_id', $n->id)
                                ->where('fecha', '>=', $hoy)
                                ->update(['progreso' => $progreso]);
                });
        });

        /* 4️⃣  Respuesta */
        return response()->json(['message' => 'Progreso actualizado correctamente'], 200);
    }





    public function obtenerHistorialProgreso($tareaId)
    {
        $historial = TareaFecha::where('tarea_id', $tareaId)
            ->where('fecha', '<', now()->toDateString())
            ->orderBy('fecha', 'desc')
            ->get(['fecha', 'progreso']);

        return response()->json($historial);
    }
}