<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lista;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ListaController extends Controller
{
    public function index(Request $request)
    {
        $tipo = $request->query('tipo', 'individual');
        $user = Auth::user();

        // 1) Obtengo todas las listas propias (sin eager‐loading de colaboradores aún)
        $propias = $user->listas()
                        ->where('tipo', $tipo)
                        ->with('tareas')
                        ->get();

        // 2) Para cada lista propia, busco en la tabla permisos los colaboradores
        $propiasConColabs = $propias->map(function($lista) {
            // obtengo todos los usuarios que aparecen en permisos para esta lista
            $colabs = DB::table('permisos')
                        ->join('users', 'users.id', '=', 'permisos.user_id')
                        ->where('permisos.lista_id', $lista->id)
                        ->where('permisos.lista_user_id', $lista->user_id)
                        ->select([
                            'users.id as id',
                            'users.name as name',
                            'users.email as email',
                            'permisos.permiso as permiso'
                        ])
                        ->get();

            // agrego esa colección directamente en la propiedad "colaboradores"
            $lista->colaboradores = $colabs;
            return $lista;
        });

        // 3) Ahora traigo las que el usuario es colaborador (no necesita mostrar “colaboradores”,
        //    porque él mismo es colaborador de esas listas)
        $compartidas = $user->listasCompartidas()
                           ->where('tipo', $tipo)
                           ->with('tareas')
                           ->get();

        // 4) Devuelvo el merge: primero las propias (con campo colaboradores), luego las compartidas
        return $propiasConColabs->merge($compartidas);
    }

    public function quitarColaborador($listaId, $userId)
    {
        $lista = Lista::where('id', $listaId)->where('user_id', Auth::id())->firstOrFail();

        \DB::table('permisos')->where([
            'lista_id' => $listaId,
            'lista_user_id' => $lista->user_id,
            'user_id' => $userId
        ])->delete();

        return response()->json(['ok' => true]);
    }



    public function show($id)
    {
        $userId = Auth::id();

        // 1) Intentamos cargarla como dueño, con tareas y con colaboradores
        $lista = Lista::where('id', $id)
            ->where('user_id', $userId)
            ->with([
                'tareas'       => function($q) use ($userId) {
                    $q->where('user_id', $userId)
                      ->whereNull('padre')
                      ->with('subtareas');
                },
                'colaboradores'  // <--- agregamos la relación aquí
            ])
            ->first();

        if (!$lista) {
            // 2) Si no eres dueño, quizá eres colaborador
            $permiso = \DB::table('permisos')
                ->where('lista_id', $id)
                ->where('user_id', $userId)
                ->first();

            if ($permiso) {
                // Cárgala desde el dueño que corresponda, pero también con colaboradores
                $lista = Lista::where('id', $id)
                    ->where('user_id', $permiso->lista_user_id)
                    ->with([
                        'tareas'       => function($q) {
                            $q->whereNull('padre')->with('subtareas');
                        },
                        'colaboradores'  // <--- añadimos la relación aquí también
                    ])
                    ->first();
                // (opcional) si quieres incluir el permiso que tienes sobre esta lista:
                $lista->permiso_colaborador = $permiso->permiso;
            }
        }

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada o sin permisos'], 404);
        }

        // Aseguramos que, si no hubo subtareas, quede como array vacío
        $lista->tareas->each(function ($tarea) {
            if (! isset($tarea->subtareas)) {
                $tarea->subtareas = collect([]);
            }
            $tarea->subtareas->each(function ($sub) {
                if (! isset($sub->subtareas)) {
                    $sub->subtareas = collect([]);
                }
            });
        });

        return response()->json($lista);
    }


    public function store(Request $request) {
        $validatedData = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string|max:255',
            'user_id' => 'required|exists:users,id',
            'tipo' => 'required|in:diaria,individual', // 🔹 Validación de tipo
            'descripcion' => 'nullable|string|max:1000'
        ]);

        // 🔹 Verificar si ya existe la lista ANTES de crearla
        $listaExistente = Lista::where('id', $validatedData['id'])
                            ->where('user_id', $validatedData['user_id'])
                            ->first();

        if ($listaExistente) {
            return response()->json(['message' => 'Ya tienes una lista creada para esta fecha'], 409);
        }

        $lista = Lista::create($validatedData);
        
        return response()->json($lista, 201);
    }

    public function update(Request $request, $id)
    {
        $lista = auth()->user()->listas()->find($id);

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        $lista->update($request->all()); // 🔹 Guarda automáticamente todos los cambios
        return response()->json(['message' => 'Lista actualizada con éxito', 'lista' => $lista]);
    }

    public function destroy($id)
    {
        // 🔹 Buscar la lista por ID y usuario autenticado
        $lista = Lista::where('id', $id)->where('user_id', Auth::id())->first();

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        // 🔹 Eliminar la lista
        $lista->delete();

        return response()->json(['message' => 'Lista eliminada correctamente'], 200);
    }

    public function compartir(Request $request, $id)
    {
        $request->validate([
            'email'   => 'required|email|exists:users,email',
            'permiso' => 'required|in:ver,editar,progreso,asignar'
        ]);

        $lista = Lista::where('id', $id)
                    ->where('user_id', Auth::id())
                    ->firstOrFail();

        $userCompartir = User::where('email', $request->email)->firstOrFail();

        // No te puedes compartir a ti mismo
        if ($userCompartir->id === Auth::id()) {
            return response()->json(['error' => 'No puedes compartir contigo mismo'], 400);
        }

        // Crear o actualizar permiso
        \DB::table('permisos')->updateOrInsert(
            [
                'lista_id'      => $lista->id,
                'lista_user_id' => $lista->user_id,
                'user_id'       => $userCompartir->id
            ],
            [
                'permiso'       => $request->permiso,
                'updated_at'    => now(),
                'created_at'    => now()
            ]
        );

        return response()->json(['ok' => true, 'mensaje' => 'Lista compartida con ' . $userCompartir->name]);
    }


}