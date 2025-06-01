<?php

// database/migrations/xxxx_xx_xx_create_permisos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('permisos', function (Blueprint $table) {
            $table->id();
            $table->string('lista_id', 8);
            $table->unsignedBigInteger('lista_user_id'); // <<--- este campo nuevo
            $table->unsignedBigInteger('user_id'); // el colaborador
            $table->enum('permiso', ['ver', 'editar', 'progreso', 'asignar']);
            $table->timestamps();

            $table->foreign(['lista_id', 'lista_user_id'])
                ->references(['id', 'user_id'])
                ->on('lists')
                ->onDelete('cascade');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->unique(['lista_id', 'lista_user_id', 'user_id']); // un colaborador por lista
        });

    }
    public function down()
    {
        Schema::dropIfExists('permisos');
    }
};
