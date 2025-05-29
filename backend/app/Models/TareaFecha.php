<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TareaFecha extends Model
{
    use HasFactory;

    protected $table = 'tareas_fechas'; // 🔹 Especificar la tabla de la base de datos
    protected $fillable = ['tarea_id', 'fecha', 'hora', 'progreso']; // 🔹 Campos permitidos para inserción

    public function setHoraAttribute($value)
    {
        if (is_null($value) || $value === '' || $value === '--:--') {
            $this->attributes['hora'] = null;
        } else {
            $this->attributes['hora'] = Carbon::parse($value)->format('H:i');
        }
    }


    public function getHoraAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('H:i') : null;
    }


    public function tarea()
    {
        /* 👇  con esto la relación trae incluso las tareas soft-deleted */
        return $this->belongsTo(Tarea::class, 'tarea_id', 'id')
                    ->withTrashed();           // ← añade esta llamada
    }
}