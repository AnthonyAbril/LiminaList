<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListaController;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\UserController;

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
    Route::put('/lists/{id}', [ListaController::class, 'update']); 
    Route::post('/lists', [ListaController::class, 'store']); // 🔹 Asegurar que `store` está presente
    Route::delete('/lists/{id}', [ListaController::class, 'destroy']);
    Route::post('/editar-progreso', [TareaController::class, 'editarProgreso']);
    
    Route::get('/ajustes', [UserController::class, 'getAjustes']);
    Route::put('/ajustes', [UserController::class, 'guardarAjustes']);
    
    Route::get('/historial-progreso/{tareaId?}', [TareaController::class, 'historialProgresoGeneral']);

    Route::get('/eventos-proximos', [TareaController::class, 'eventosProximos']);
    Route::get('/eventos-por-fecha', [TareaController::class, 'eventosPorFecha']);
    Route::post('/asignar-tarea-fechas', [TareaController::class, 'asignarTareaFechas']);
    Route::get('/tarea-asignaciones/{tareaId}', [TareaController::class, 'getAsignaciones']);
    Route::post('/editar-asignaciones-tarea', [TareaController::class, 'editarAsignaciones']);

    Route::get('/tareas', [TareaController::class, 'index']); // Obtener todas las tareas
    Route::get('/tareas/{id}', [TareaController::class, 'show']); // Obtener una tarea específica
    Route::post('/tareas', [TareaController::class, 'store']); // Crear una nueva tarea
    Route::put('/tareas/{id}', [TareaController::class, 'update']); // Editar una tarea existente
    Route::delete('/tareas/{id}', [TareaController::class, 'destroy']); // Eliminar una tarea


    Route::get('/user', function (Request $request) {
        return response()->json($request->user()); // Información del usuario autenticado
    });
    Route::put('/user/update', [UserController::class, 'update']);
    Route::post('/user/password', [UserController::class, 'updatePassword']);
    Route::delete('/user/delete', [UserController::class, 'destroy']);

    Route::put('/lists/{id}', [ListaController::class, 'update']); // 🔹 Ruta para actualizar listas
});