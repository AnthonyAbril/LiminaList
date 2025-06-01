<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Model;
use App\Models\Lista;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public function listas(): HasMany
    {
        return $this->hasMany(Lista::class, 'user_id');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'theme_colors' => 'array', // 👈 necesario
    ];

    public function listasCompartidas()
{
    return $this->belongsToMany(
        \App\Models\Lista::class,
        'permisos',
        'user_id',
        'lista_id'
    )
    ->withPivot('permiso', 'lista_user_id')
    ->withTimestamps();
}

}
