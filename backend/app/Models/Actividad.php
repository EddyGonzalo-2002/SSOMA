<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Actividad extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'actividades';

    protected $fillable = [
        'area_id',
        'nombre',
        'descripcion',
        'estado',
        'fecha_programada',
        'created_by',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function formularios(): BelongsToMany
    {
        return $this->belongsToMany(Formulario::class, 'actividad_formulario')
                    ->withTimestamps();
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Respuesta::class);
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopeActiva($query)
    {
        return $query->where('estado', 'activa');
    }
}
