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
    // 2025_04_26_141815_create_tasks_table.php
public function up()
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->unsignedBigInteger('id')->primary();
        $table->string('title');
        $table->text('description')->nullable();
        $table->integer('progreso')->nullable();

        // relación con lists
        $table->string('list_id', 8);
        $table->unsignedBigInteger('user_id');

        $table->boolean('rutinario')->default(false);

        /* columna padre -- SIN FK todavía, pero con índice */
        $table->unsignedBigInteger('padre')->nullable()->index();

        /* timestamps + soft-deletes */
        $table->timestamps();
        $table->softDeletes();

        /* FK con lists (compuesta) */
        $table->foreign(['list_id','user_id'])
              ->references(['id','user_id'])
              ->on('lists')
              ->cascadeOnDelete();
    });

    /* ───── segundo paso: añadir la FK autorreferenciada ───── */
    Schema::table('tasks', function (Blueprint $table) {
        $table->foreign('padre')
              ->references('id')
              ->on('tasks')
              ->cascadeOnDelete();
    });
}

public function down()
{
    /* suelta primero la FK autorreferenciada */
    Schema::table('tasks', function (Blueprint $table) {
        $table->dropForeign('tasks_padre_foreign');
    });

    Schema::dropIfExists('tasks');
}

};
