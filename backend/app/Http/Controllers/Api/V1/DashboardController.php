<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Formulario;
use App\Models\Proyecto;
use App\Models\Respuesta;
use App\Models\Aprobacion;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'proyectos' => Proyecto::count(),
            'areas' => Area::count(),
            'formularios' => Formulario::count(),
            'respuestas' => Respuesta::whereDate('created_at', today())->count(),
            'pendientes' => Aprobacion::where('estado', 'pendiente')->count(),
            'aprobados' => Aprobacion::where('estado', 'aprobado')->count(),
        ];

        // Also fetch recent activity (last 5 respuestas)
        $actividadReciente = Respuesta::with(['formulario:id,nombre,codigo', 'proyecto:id,nombre', 'usuario:id,name'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($respuesta) {
                return [
                    'id' => $respuesta->id,
                    'formulario' => $respuesta->formulario->nombre,
                    'codigo' => $respuesta->formulario->codigo,
                    'proyecto' => $respuesta->proyecto->nombre,
                    'usuario' => $respuesta->usuario->name,
                    'estado' => $respuesta->estado_general,
                    'fecha' => $respuesta->created_at->diffForHumans(),
                ];
            });

        // Aprobaciones ratio (total aprobadas vs pendientes vs rechazadas)
        $totalAprobaciones = Aprobacion::count() ?: 1; // Prevent division by zero
        $aprobados = Aprobacion::where('estado', 'aprobado')->count();
        $pendientes = Aprobacion::where('estado', 'pendiente')->count();
        $rechazados = Aprobacion::where('estado', 'rechazado')->count();

        $ratio = [
            'aprobados' => round(($aprobados / $totalAprobaciones) * 100),
            'pendientes' => round(($pendientes / $totalAprobaciones) * 100),
            'rechazados' => round(($rechazados / $totalAprobaciones) * 100),
        ];

        return response()->json([
            'data' => [
                'stats' => $stats,
                'actividad' => $actividadReciente,
                'ratio' => $ratio,
            ]
        ]);
    }
}
