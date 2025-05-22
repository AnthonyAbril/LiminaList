<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    use HasFactory;
    
    protected $table = 'tasks'; // ¡IMPORTANTE! Laravel intentará usar "listas", así que forzamos "lists"
    
    
    protected $primaryKey = 'id'; // 🔹 Definir la clave primaria manualmente
    public $incrementing = false; // 🔹 Indicar que no es autoincremental
    protected $keyType = 'int'; // 🔹 Asegurar que el ID es de tipo entero


    protected $fillable = ['id','title', 'description', 'progreso', 'list_id', 'user_id', 'padre', 'rutinario'];

    //protected $appends = ['title'];

    public function getTitleAttribute()
    {
        return $this->attributes['title']; // 🔹 Ahora Laravel usará la columna correcta
    }

    public function lista() {
        return $this->belongsTo(Lista::class, 'list_id', 'id');
    }

    public function subtareas() {
        return $this->hasMany(Tarea::class, 'padre')->with('subtareas'); // 🔹 Recursividad asegurada
    }

    public function fechas()
    {
        return $this->hasMany(TareaFecha::class, 'tarea_id');
    }
}