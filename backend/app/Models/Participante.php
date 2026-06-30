<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Participante extends Model
{
    use HasFactory;

    protected $table = 'participantes';

    protected $fillable = [
        'respuesta_id',
        'nombre',
        'dni',
        'cargo',
        'empresa',
        'firma',
        'fecha',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function respuesta(): BelongsTo
    {
        return $this->belongsTo(Respuesta::class);
    }

    // ── Helpers ─────────────────────────────────────────

    /**
     * Verifica si el participante tiene firma registrada.
     */
    public function tieneFirma(): bool
    {
        return !empty($this->firma);
    }
}
