<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lista;
use Illuminate\Support\Facades\Auth;

class ListaController extends Controller
{
    public function index(Request $request)
    {
        //return Auth::user()->listas()->with('tareas')->get(); //devuelve todas las listas
        $tipo = $request->query('tipo', 'individual');
        
        return Auth::user()
        ->listas()
        ->where('tipo', $tipo)
        ->with('tareas')
        ->get();  //devuelve solo las listas individuales
    }

    public function show($id)
    {
        $lista = Lista::where('id', $id)
        ->where('user_id', Auth::id()) // 🔹 Permitir cualquier tipo de lista
        ->with(['tareas' => function ($query) {
            $query->where('user_id', Auth::id())->whereNull('padre')->with('subtareas');
        }])->first();



        if (!$lista) {
            return response()->json(['message' => 'Lista no encontrada'], 404);
        }

        // 🔹 Recorre todas las tareas y subtareas para garantizar que `subtareas` exista como un array vacío
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
            'tipo' => 'required|in:diaria,individual' // 🔹 Validación de tipo
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

}