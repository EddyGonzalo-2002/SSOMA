<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'dni',
        'telefono',
        'cargo',
        'avatar',
        'firma_imagen',
        'estado',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ── Relaciones SSOMA ────────────────────────────────

    public function proyectos(): BelongsToMany
    {
        return $this->belongsToMany(Proyecto::class, 'user_proyecto')
                    ->withTimestamps();
    }

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'user_area')
                    ->withTimestamps();
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Respuesta::class, 'usuario_id');
    }

    public function aprobaciones(): HasMany
    {
        return $this->hasMany(Aprobacion::class, 'usuario_id');
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class, 'usuario_id');
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopeActivo($query)
    {
        return $query->where('estado', 'activo');
    }

    // ── Helpers ─────────────────────────────────────────

    /**
     * Verifica si el usuario tiene firma pre-cargada (supervisores/revisores).
     */
    public function tieneFirma(): bool
    {
        return !empty($this->firma_imagen);
    }

    /**
     * Verifica si el usuario está asignado a un proyecto específico.
     */
    public function perteneceAlProyecto(int $proyectoId): bool
    {
        return $this->proyectos()->where('proyectos.id', $proyectoId)->exists();
    }

    /**
     * Verifica si el usuario está asignado a un área específica.
     */
    public function perteneceAlArea(int $areaId): bool
    {
        return $this->areas()->where('areas.id', $areaId)->exists();
    }
}
