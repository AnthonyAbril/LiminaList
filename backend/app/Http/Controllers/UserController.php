<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
class UserController extends Controller
{
    public function getAjustes(Request $request)
    {
        $user = $request->user();
        return response()->json($user->theme_colors ?? []);
    }


    public function guardarAjustes(Request $request)
    {
        $data = $request->validate([
            'modoOscuro' => 'required|boolean',
            'coloresClaro' => 'required|array',
            'coloresOscuro' => 'required|array',
            'patronesGuardados' => 'nullable|array',
            'patronActivo' => 'nullable|string'
        ]);

        $user = $request->user();
        $user->theme_colors = $data;
        $user->save();

        return response()->json(['success' => true]);
    }


    // en UserController
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $user = $request->user();
        $user->name = $data['name'];
        $user->save();

        return response()->json(['success' => true, 'name' => $user->name]);
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'password' => 'required|string|min:8'
        ]);

        $user = $request->user();
        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();
        $user->delete(); // soft delete si está habilitado
        return response()->json(['success' => true]);
    }

}
