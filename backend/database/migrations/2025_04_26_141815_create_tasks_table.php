<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary(); // 🔹 Define `id` como clave primaria
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('progreso')->nullable();
            $table->string('list_id', 8);
            $table->timestamps();

            // 🔹 Definir la clave foránea para `list_id`
            $table->foreign('list_id')->references('id')->on('lists')->onDelete('cascade');

            // 🔹 Asegurar que `id` también es clave única antes de la relación recursiva
            $table->unique('id');  // 🔹 Agrega índice único para evitar error de clave foránea

            // 🔹 Agregar la relación recursiva correctamente
            $table->unsignedBigInteger('padre')->nullable();
            $table->foreign('padre')->references('id')->on('tasks')->onDelete('cascade');
        });
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tasks');
    }
};
