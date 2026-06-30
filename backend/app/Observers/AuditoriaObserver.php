<?php

namespace App\Observers;

use App\Models\Auditoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditoriaObserver
{
    /**
     * Tablas que serán auditadas automáticamente.
     */
    private function debeAuditar(Model $model): bool
    {
        $tablasAuditables = [
            'proyectos', 'areas', 'users', 'formularios', 'campos',
            'respuestas', 'participantes', 'aprobaciones', 'evidencias',
            'roles_firma', 'opciones_campo',
        ];

        return in_array($model->getTable(), $tablasAuditables);
    }

    public function created(Model $model): void
    {
        if (!$this->debeAuditar($model)) return;

        Auditoria::create([
            'tabla' => $model->getTable(),
            'registro_id' => $model->getKey(),
            'accion' => 'crear',
            'usuario_id' => Auth::id(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'valores_anteriores' => null,
            'valores_nuevos' => $model->getAttributes(),
        ]);
    }

    public function updated(Model $model): void
    {
        if (!$this->debeAuditar($model)) return;

        $cambios = $model->getChanges();
        unset($cambios['updated_at']); // No auditar timestamps

        if (empty($cambios)) return;

        Auditoria::create([
            'tabla' => $model->getTable(),
            'registro_id' => $model->getKey(),
            'accion' => 'actualizar',
            'usuario_id' => Auth::id(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'valores_anteriores' => collect($model->getOriginal())
                ->only(array_keys($cambios))
                ->toArray(),
            'valores_nuevos' => $cambios,
        ]);
    }

    public function deleted(Model $model): void
    {
        if (!$this->debeAuditar($model)) return;

        Auditoria::create([
            'tabla' => $model->getTable(),
            'registro_id' => $model->getKey(),
            'accion' => 'eliminar',
            'usuario_id' => Auth::id(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'valores_anteriores' => $model->getAttributes(),
            'valores_nuevos' => null,
        ]);
    }
}
