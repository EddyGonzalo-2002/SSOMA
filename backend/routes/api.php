<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProyectoController;
use App\Http\Controllers\Api\V1\AreaController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\FormularioController;
use App\Http\Controllers\Api\V1\RespuestaController;
use App\Http\Controllers\Api\V1\AprobacionController;
use App\Http\Controllers\Api\V1\EvidenciaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - ERP SSOMA
|--------------------------------------------------------------------------
|
| Todas las rutas están prefijadas con /api/v1
| Autenticación mediante Laravel Sanctum (Bearer Token)
|
*/

// ── Rutas públicas ──────────────────────────────────────
Route::prefix('v1')->group(function () {

    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Ruta de prueba
    Route::get('/ping', function () {
        return "pong, Laravel está vivo!";
    });

    // Ruta secreta temporal para inicializar la base de datos de producción
    Route::get('/init-db-seeder-secreto', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
            return response()->json(['message' => '¡Base de datos sembrada con éxito! Ya puedes iniciar sesión.']);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error o la base de datos ya estaba sembrada.',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
        }
    });

    // ── Rutas protegidas ────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\Api\V1\DashboardController::class, 'stats']);

    // Proyectos
        Route::apiResource('proyectos', ProyectoController::class);
        Route::post('/proyectos/{proyecto}/asignar-usuarios', [ProyectoController::class, 'asignarUsuarios']);
        Route::post('/proyectos/{proyecto}/desasignar-usuarios', [ProyectoController::class, 'desasignarUsuarios']);
        Route::put('/proyectos/{proyecto}/usuarios', [ProyectoController::class, 'syncUsuarios']);

        // Actividades (anidadas bajo area)
        Route::get('/areas/{area}/actividades', [\App\Http\Controllers\Api\V1\ActividadController::class, 'index']);
        Route::post('/areas/{area}/actividades', [\App\Http\Controllers\Api\V1\ActividadController::class, 'store']);
        Route::get('/areas/{area}/actividades/{actividad}', [\App\Http\Controllers\Api\V1\ActividadController::class, 'show']);
        Route::put('/areas/{area}/actividades/{actividad}', [\App\Http\Controllers\Api\V1\ActividadController::class, 'update']);
        Route::delete('/areas/{area}/actividades/{actividad}', [\App\Http\Controllers\Api\V1\ActividadController::class, 'destroy']);

        // Áreas
        Route::apiResource('areas', AreaController::class);
        Route::post('/areas/{area}/asignar-usuarios', [AreaController::class, 'asignarUsuarios']);

        // Usuarios
        Route::apiResource('usuarios', UserController::class)->parameters(['usuarios' => 'user']);
        Route::post('/usuarios/{user}/firma', [UserController::class, 'subirFirma']);

        // Roles
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);

        // Formularios
        Route::apiResource('formularios', FormularioController::class);
        Route::put('/formularios/{formulario}/campos', [FormularioController::class, 'syncCampos']);

        // Respuestas
        Route::apiResource('respuestas', RespuestaController::class)->except(['update']);
        Route::get('/respuestas/{respuesta}/pdf', [\App\Http\Controllers\Api\V1\ReporteController::class, 'exportPdf']);

        // Aprobaciones
        Route::get('/aprobaciones/pendientes', [AprobacionController::class, 'pendientes']);
        Route::post('/aprobaciones/{aprobacion}/firmar', [AprobacionController::class, 'firmar']);
        Route::post('/aprobaciones/{aprobacion}/rechazar', [AprobacionController::class, 'rechazar']);

        // Evidencias
        Route::get('/evidencias', [EvidenciaController::class, 'index']);
        Route::post('/evidencias', [EvidenciaController::class, 'store']);
        Route::delete('/evidencias/{evidencia}', [EvidenciaController::class, 'destroy']);
    });
});
