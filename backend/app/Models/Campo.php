<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campo extends Model
{
    use HasFactory;

    protected $table = 'campos';

    protected $fillable = [
        'formulario_id',
        'etiqueta',
        'nombre_campo',
        'tipo',
        'obligatorio',
        'orden',
        'placeholder',
        'valor_defecto',
        'validaciones',
        'configuracion',
        'seccion_padre_id',
    ];

    protected $casts = [
        'obligatorio' => 'boolean',
        'orden' => 'integer',
        'validaciones' => 'array',
        'configuracion' => 'array',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function formulario(): BelongsTo
    {
        return $this->belongsTo(Formulario::class);
    }

    public function opciones(): HasMany
    {
        return $this->hasMany(OpcionCampo::class)->orderBy('orden');
    }

    public function seccionPadre(): BelongsTo
    {
        return $this->belongsTo(Campo::class, 'seccion_padre_id');
    }

    public function camposHijos(): HasMany
    {
        return $this->hasMany(Campo::class, 'seccion_padre_id')->orderBy('orden');
    }

    public function detalleRespuestas(): HasMany
    {
        return $this->hasMany(DetalleRespuesta::class);
    }

    // ── Helpers ─────────────────────────────────────────

    public function tieneOpciones(): bool
    {
        return in_array($this->tipo, ['select', 'multiselect', 'radio', 'checkbox']);
    }

    public function esArchivo(): bool
    {
        return in_array($this->tipo, ['foto', 'firma', 'archivo']);
    }
}
