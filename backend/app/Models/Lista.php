<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Lista extends Model
{
    use HasFactory;
    
    protected $table = 'lists';     
    protected $primaryKey = 'id';
    public $incrementing = false; // 🔹 No es autoincremental
    protected $keyType = 'string'; // 🔹 Ahora es un string


    
    protected $fillable = ['id', 'name', 'user_id' , 'tipo', 'descripcion'];

    public function tareas() {
        //return $this->hasMany(Tarea::class, 'list_id');
        return $this->hasMany(Tarea::class, 'list_id')->where('user_id', auth()->id());
    }

    public function colaboradores()
    {
        return $this->belongsToMany(
            User::class,
            'permisos',
            'lista_id',
            'user_id'
        )->withPivot('permiso', 'lista_user_id')->withTimestamps()
        ->wherePivot('lista_user_id', $this->user_id);
    }

}
