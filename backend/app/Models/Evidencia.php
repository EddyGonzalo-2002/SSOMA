<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evidencia extends Model
{
    use HasFactory;

    protected $table = 'evidencias';

    protected $fillable = [
        'respuesta_id',
        'url',
        'nombre_archivo',
        'tipo',
        'mime_type',
        'tamano_bytes',
        'usuario_id',
        'latitud',
        'longitud',
        'fecha',
    ];

    protected $casts = [
        'tamano_bytes' => 'integer',
        'latitud' => 'decimal:8',
        'longitud' => 'decimal:8',
        'fecha' => 'datetime',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function respuesta(): BelongsTo
    {
        return $this->belongsTo(Respuesta::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // ── Helpers ─────────────────────────────────────────

    public function esFoto(): bool
    {
        return $this->tipo === 'foto';
    }

    public function esDocumento(): bool
    {
        return $this->tipo === 'documento';
    }
}
