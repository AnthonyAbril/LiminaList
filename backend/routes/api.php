<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListaController;

// 🔹 Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/saludo', function () {
    return response()->json(['mensaje' => '¡Hola desde Laravel!']);
});

// 🔹 Rutas protegidas para usuarios autenticados
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/lists', [ListaController::class, 'index']); // Obtener listas del usuario autenticado
    Route::get('/lists/{id}', [ListaController::class, 'show']); // 🔹 Obtener una lista específica
    Route::get('/user', function (Request $request) {
        return response()->json($request->user()); // Información del usuario autenticado
    });
});