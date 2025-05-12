<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;

class TareaController extends Controller
{
    public function index() {
        return Tarea::all();
    }

    public function store(Request $request) {
        $validatedData = $request->validate([
             'id' => 'required|integer|unique:tasks,id', // 🔹 Permitir IDs personalizados
            'title' => 'required|string|max:255',
            'list_id' => 'required|string|size:8|exists:lists,id', // ✅ Ahora acepta `VARCHAR(8)`
            'padre' => 'nullable|integer|exists:tasks,id',  // 🔹 Asegura que `padre` existe en la tabla `tareas` si no es null
        ]);

        $tarea = Tarea::create($validatedData);

        return response()->json($tarea, 201);
    }

    public function show($id) {
        return Tarea::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $tarea = Tarea::findOrFail($id);
        $tarea->update($request->all());
        return response()->json($tarea);
    }

    public function destroy($id) {
        Tarea::destroy($id);
        return response()->json(['message' => 'Tarea eliminada'], 200);
    }
}