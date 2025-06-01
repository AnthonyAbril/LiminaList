<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lista;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ListaController extends Controller
{
    public function index(Request $request)
    {
        $tipo = $request->query('tipo', 'individual');
        $user = Auth::user();

        $propias = $user->listas()->where('tipo', $tipo)->with('tareas')->get();
        $compartidas = $user->listasCompartidas()->where('tipo', $tipo)->with('tareas')->get();

        return $propias->merge($compartidas);
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

        // Es el dueño
        $lista = Lista::where('id', $id)
            ->where('user_id', $userId)
            ->with(['tareas' => function ($query) use ($userId) {
                $query->where('user_id', $userId)->whereNull('padre')->with('subtareas');
            }])->first();

        if (!$lista) {
            // ¿Es colaborador?
            $permiso = \DB::table('permisos')
                ->where('lista_id', $id)
                ->where('user_id', $userId)
                ->first();

            if ($permiso) {
                // Si es colaborador, carga la lista del dueño correspondiente
                $lista = Lista::where('id', $id)
                    ->where('user_id', $permiso->lista_user_id)
                    ->with(['tareas' => function ($query) use ($userId) {
                        // Si quieres, puedes mostrar todas las tareas, o solo las que puede ver el colaborador
                        $query->whereNull('padre')->with('subtareas');
                    }])->first();
            }
        }

        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada o sin permisos'], 404);
        }

        // Garantiza subtareas como array vacío
        $lista->tareas->each(function ($tarea) {
            if (!isset($tarea->subtareas)) {
                $tarea->subtareas = collect([]);
            }
            $tarea->subtareas->each(function ($subtarea) {
                if (!isset($subtarea->subtareas)) {
                    $subtarea->subtareas = collect([]);
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