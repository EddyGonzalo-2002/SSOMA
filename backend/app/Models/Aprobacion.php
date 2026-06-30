<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Aprobacion extends Model
{
    use HasFactory;

    protected $table = 'aprobaciones';

    protected $fillable = [
        'respuesta_id',
        'rol_firma_id',
        'usuario_id',
        'estado',
        'firma',
        'comentario',
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

    public function rolFirma(): BelongsTo
    {
        return $this->belongsTo(RolFirma::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // ── Scopes ──────────────────────────────────────────

    public function scopePendiente($query)
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeFirmado($query)
    {
        return $query->where('estado', 'firmado');
    }

    // ── Helpers ─────────────────────────────────────────

    public function estaFirmado(): bool
    {
        return $this->estado === 'firmado';
    }

    public function estaPendiente(): bool
    {
        return $this->estado === 'pendiente';
    }

    public function getFirmaBase64Attribute()
    {
        if (!$this->firma) return null;
        $path = storage_path('app/public/' . $this->firma);
        if (file_exists($path)) {
            $type = pathinfo($path, PATHINFO_EXTENSION);
            $data = file_get_contents($path);
            return 'data:image/' . $type . ';base64,' . base64_encode($data);
        }
        return null;
    }
}
