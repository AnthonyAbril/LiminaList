<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tarea extends Model
{
    use HasFactory, SoftDeletes;
    
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

    

    // Tarea.php
    public function scopeRaiz($q)  { return $q->whereNull('padre'); }
    public function scopeHijos($q) { return $q->whereNotNull('padre'); }


    /**  🔄  Devuelve la raíz + todos los descendientes en un solo collection  */
    public function descendientesRecursivos()
    {
        $this->loadRecursive('subtareas');

        $todo = collect([$this]);
        $recorrer = function ($t) use (&$recorrer, &$todo) {
            foreach ($t->subtareas as $hijo) {
                $todo->push($hijo);
                $recorrer($hijo);
            }
        };
        $recorrer($this);
        return $todo->unique('id');   // por si acaso
    }

    /** Carga recursivamente cualquier relación */
    protected function loadRecursive($rel)
    {
        $this->load($rel);
        $this->$rel->each(fn ($h) => $h->loadRecursive($rel));
    }



    /** — pequeño trait interno — */
    protected function flattenDescendants($level = 0)
    {
        $all = collect([$this]);
        foreach ($this->subtareas as $sub) {
            $all = $all->merge($sub->flattenDescendants($level + 1));
        }
        return $all;
    }


}