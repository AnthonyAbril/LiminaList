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


    
    protected $fillable = ['id', 'name', 'user_id'];

    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class, 'list_id');
    }
}
