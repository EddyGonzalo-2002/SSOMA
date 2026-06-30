<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Proyecto extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'proyectos';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'ubicacion',
        'ruc',
        'razon_social',
        'actividad_economica',
        'estado',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function areas(): HasMany
    {
        return $this->hasMany(Area::class);
    }

    public function formularios(): HasMany
    {
        return $this->hasMany(Formulario::class);
    }

    public function actividades()
    {
        return $this->hasManyThrough(Actividad::class, Area::class);
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Respuesta::class);
    }

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_proyecto')
                    ->withTimestamps();
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopeActivo($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeFinalizado($query)
    {
        return $query->where('estado', 'finalizado');
    }
}
