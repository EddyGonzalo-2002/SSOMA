<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auditoria extends Model
{
    const UPDATED_AT = null;

    protected $table = 'auditoria';

    protected $fillable = [
        'tabla',
        'registro_id',
        'accion',
        'usuario_id',
        'ip_address',
        'user_agent',
        'valores_anteriores',
        'valores_nuevos',
    ];

    protected $casts = [
        'valores_anteriores' => 'array',
        'valores_nuevos' => 'array',
    ];

    // ── Relaciones ──────────────────────────────────────

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
