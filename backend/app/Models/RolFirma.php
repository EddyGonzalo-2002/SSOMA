<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RolFirma extends Model
{
    use HasFactory;

    protected $table = 'roles_firma';

    protected $fillable = [
        'formulario_id',
        'rol',
        'nombre_display',
        'orden',
        'obligatorio',
    ];

    protected $casts = [
        'orden' => 'integer',
        'obligatorio' => 'boolean',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function formulario(): BelongsTo
    {
        return $this->belongsTo(Formulario::class);
    }

    public function aprobaciones(): HasMany
    {
        return $this->hasMany(Aprobacion::class);
    }
}
