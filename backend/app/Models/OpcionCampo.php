<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpcionCampo extends Model
{
    use HasFactory;

    protected $table = 'opciones_campo';

    protected $fillable = [
        'campo_id',
        'valor',
        'etiqueta',
        'orden',
    ];

    protected $casts = [
        'orden' => 'integer',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function campo(): BelongsTo
    {
        return $this->belongsTo(Campo::class);
    }
}
