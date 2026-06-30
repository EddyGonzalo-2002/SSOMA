<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Respuesta extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'respuestas';

    protected $fillable = [
        'uuid',
        'formulario_id',
        'usuario_id',
        'proyecto_id',
        'actividad_id',
        'area_id',
        'estado_general',
        'fecha',
        'latitud',
        'longitud',
        'notas',
        'datos',
        'synced_at',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'latitud' => 'decimal:8',
        'longitud' => 'decimal:8',
        'datos' => 'array',
        'synced_at' => 'datetime',
    ];

    // ── Boot ────────────────────────────────────────────

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }

    // ── Relaciones ──────────────────────────────────────

    public function formulario(): BelongsTo
    {
        return $this->belongsTo(Formulario::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleRespuesta::class);
    }

    public function participantes(): HasMany
    {
        return $this->hasMany(Participante::class);
    }

    public function aprobaciones(): HasMany
    {
        return $this->hasMany(Aprobacion::class)->orderBy('id');
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class);
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopePendiente($query)
    {
        return $query->where('estado_general', 'pendiente');
    }

    public function scopeAprobado($query)
    {
        return $query->where('estado_general', 'aprobado');
    }

    public function scopeDelProyecto($query, int $proyectoId)
    {
        return $query->where('proyecto_id', $proyectoId);
    }

    // ── Helpers ─────────────────────────────────────────

    public function estaAprobado(): bool
    {
        return $this->estado_general === 'aprobado';
    }

    public function estaPendiente(): bool
    {
        return in_array($this->estado_general, ['pendiente', 'en_proceso']);
    }
}
