<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formulario extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'formularios';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'proyecto_id',
        'area_id',
        'version',
        'requiere_participantes',
        'requiere_geolocalizacion',
        'estado',
        'created_by',
    ];

    protected $casts = [
        'requiere_participantes' => 'boolean',
        'requiere_geolocalizacion' => 'boolean',
        'version' => 'integer',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function campos(): HasMany
    {
        return $this->hasMany(Campo::class)->orderBy('orden');
    }

    public function rolesFirma(): HasMany
    {
        return $this->hasMany(RolFirma::class)->orderBy('orden');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Respuesta::class);
    }

    public function actividades(): BelongsToMany
    {
        return $this->belongsToMany(Actividad::class, 'actividad_formulario')
                    ->withTimestamps();
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopePublicado($query)
    {
        return $query->where('estado', 'publicado');
    }

    public function scopeBorrador($query)
    {
        return $query->where('estado', 'borrador');
    }

    public function scopeDelProyecto($query, int $proyectoId)
    {
        return $query->where('proyecto_id', $proyectoId);
    }
}
