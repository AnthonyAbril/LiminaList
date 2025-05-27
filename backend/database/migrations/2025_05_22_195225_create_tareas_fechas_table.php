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
            $table->date('fecha');
            $table->time('hora',5)->nullable(); // ✅ Ahora la hora puede ser NULL

            $table->integer('progreso')->nullable();
            $table->unique(['tarea_id','fecha']);   //  ⬅️  justo antes del timestamps()

            // 🔹 Relaciones
            $table->foreign('tarea_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->timestamps(); // ✅ Esto agrega `created_at` y `updated_at`

        });
    }

    public function down()
    {
        Schema::dropIfExists('tareas_fechas');
    }
};
