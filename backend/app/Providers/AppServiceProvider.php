<?php

namespace App\Providers;

use App\Models\Area;
use App\Models\Aprobacion;
use App\Models\Campo;
use App\Models\Evidencia;
use App\Models\Formulario;
use App\Models\OpcionCampo;
use App\Models\Participante;
use App\Models\Proyecto;
use App\Models\Respuesta;
use App\Models\RolFirma;
use App\Models\User;
use App\Observers\AuditoriaObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Registrar el observer de auditoría para todos los modelos auditables
        $modelosAuditables = [
            Proyecto::class,
            Area::class,
            User::class,
            Formulario::class,
            Campo::class,
            OpcionCampo::class,
            Respuesta::class,
            Participante::class,
            Aprobacion::class,
            Evidencia::class,
            RolFirma::class,
        ];

        foreach ($modelosAuditables as $modelo) {
            $modelo::observe(AuditoriaObserver::class);
        }
    }
}
