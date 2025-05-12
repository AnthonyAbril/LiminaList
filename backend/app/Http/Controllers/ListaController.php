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
        $lista = auth()->user()->listas()->where('id', $id)
            ->with(['tareas' => function ($query) {
                $query->whereNull('padre')->with(['subtareas']);
            }])
            ->first();

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