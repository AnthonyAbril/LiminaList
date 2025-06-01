<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tareas_fechas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tarea_id');
            $table->unsignedBigInteger('user_id');      // <-- NUEVO: cada asignación pertenece a un usuario
            $table->date('fecha');
            $table->time('hora', 5)->nullable();
            $table->integer('progreso')->nullable();

            // Cambiamos la clave única para que sea por usuario
            $table->unique(['tarea_id', 'fecha', 'user_id']);

            // Relaciones
            $table->foreign('tarea_id')
                  ->references('id')->on('tasks')
                  ->cascadeOnDelete();

            $table->foreign('user_id')
                  ->references('id')->on('users')
                  ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tareas_fechas');
    }
};
