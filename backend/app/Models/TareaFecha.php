<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TareaFecha extends Model
{
    use HasFactory;

    protected $table = 'tareas_fechas'; // 🔹 Especificar la tabla de la base de datos
    protected $fillable = ['tarea_id', 'fecha', 'hora']; // 🔹 Campos permitidos para inserción

    public function tarea()
    {
        return $this->belongsTo(Tarea::class, 'tarea_id', 'id'); // ✅ Especificar correctamente `tarea_id`
    }
}