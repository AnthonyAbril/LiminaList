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
            $query->whereNull('padre')->with(['subtareas']);
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

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'id' => 'required|string',
                'name' => 'required|string|max:255',
                'user_id' => 'required|exists:users,id', // 🔹 Verifica que el usuario existe en BD
            ]);

            // 🔹 Verificar si ya existe una lista con este `id` para este usuario
            $existeLista = Lista::where('id', $request->id)->where('user_id', $request->user_id)->exists();

            if ($existeLista) {
                return response()->json(['message' => 'Ya tienes una lista creada para esta fecha'], 409);
            }




            $lista = Lista::create($validatedData);

            return response()->json($lista, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500); // 🔹 Captura el error y lo devuelve
        }


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