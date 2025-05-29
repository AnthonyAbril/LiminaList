<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getAjustes(Request $request)
    {
        $user = $request->user();
        return response()->json($user->theme_colors ?? []);
    }

    public function guardarAjustes(Request $request)
    {
        $validated = $request->validate([
            'primario' => 'required|string',
            'secundario' => 'required|string',
            'terciario' => 'required|string',
            'texto' => 'required|string',
        ]);

        $user = $request->user();
        $user->theme_colors = $validated;
        $user->save();

        return response()->json(['success' => true]);
    }


}
