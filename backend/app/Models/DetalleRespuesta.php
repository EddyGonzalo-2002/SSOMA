<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleRespuesta extends Model
{
    use HasFactory;

    protected $table = 'detalle_respuestas';

    protected $fillable = [
        'respuesta_id',
        'campo_id',
        'valor',
        'valor_archivo',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function respuesta(): BelongsTo
    {
        return $this->belongsTo(Respuesta::class);
    }

    public function campo(): BelongsTo
    {
        return $this->belongsTo(Campo::class);
    }
}
