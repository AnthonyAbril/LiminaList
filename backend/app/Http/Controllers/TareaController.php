<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;

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
        Tarea::destroy($id);
        return response()->json(['message' => 'Tarea eliminada'], 200);
    }
}