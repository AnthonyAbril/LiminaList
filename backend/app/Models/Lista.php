<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Lista extends Model
{
    use HasFactory;
    
    protected $table = 'lists'; 
    protected $fillable = ['name', 'user_id'];

    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class, 'list_id');
    }
}
