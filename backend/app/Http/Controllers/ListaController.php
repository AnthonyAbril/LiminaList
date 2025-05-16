<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lista;
use Illuminate\Support\Facades\Auth;

class ListaController extends Controller
{
    public function index()
    {
        return Auth::user()->listas()->with('tareas')->get();
    }

    public function show($id)
    {
        $lista = Lista::where('id', $id)->where('user_id', Auth::id())->with(['tareas' => function ($query) {
            $query->where('user_id', Auth::id())->whereNull('padre')->with('subtareas'); // 🔹 Filtrar por usuario
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
        ]);

        // 🔹 Verificar si ya existe la lista para este usuario
        if (Lista::where('id', $validatedData['id'])->where('user_id', $validatedData['user_id'])->exists()) {
            return response()->json(['message' => 'Ya tienes una lista creada para esta fecha'], 409);
        }

        // 🔹 Crear la lista
        return response()->json(Lista::create($validatedData), 201);
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
}