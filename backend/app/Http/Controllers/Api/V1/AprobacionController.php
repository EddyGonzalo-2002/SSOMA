<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Aprobacion;
use App\Models\Respuesta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AprobacionController extends Controller
{
    /**
     * Listar aprobaciones pendientes del usuario.
     */
    public function pendientes(Request $request): JsonResponse
    {
        $query = Aprobacion::query()
            ->where('estado', 'pendiente')
            ->with([
                'respuesta.formulario:id,nombre,codigo',
                'respuesta.usuario:id,name',
                'respuesta.proyecto:id,nombre',
                'rolFirma',
            ]);

        // Si no es admin, filtrar por proyectos asignados
        if (!$request->user()->hasRole('admin')) {
            $proyectoIds = $request->user()->proyectos()->pluck('proyectos.id');
            $query->whereHas('respuesta', function ($q) use ($proyectoIds) {
                $q->whereIn('proyecto_id', $proyectoIds);
            });
        }

        $aprobaciones = $query->orderBy('created_at', 'asc')
                              ->paginate($request->per_page ?? 15);

        return response()->json($aprobaciones);
    }

    /**
     * Firmar (aprobar) una aprobación.
     */
    public function firmar(Request $request, Aprobacion $aprobacion): JsonResponse
    {
        if ($aprobacion->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Esta aprobación ya fue procesada.',
            ], 422);
        }

        // Verificar orden: las aprobaciones anteriores deben estar firmadas
        $aprobacionesPrevias = Aprobacion::where('respuesta_id', $aprobacion->respuesta_id)
            ->whereHas('rolFirma', function ($q) use ($aprobacion) {
                $q->where('orden', '<', $aprobacion->rolFirma->orden);
            })
            ->where('estado', '!=', 'firmado')
            ->exists();

        if ($aprobacionesPrevias) {
            return response()->json([
                'message' => __('messages.approval_invalid_order'),
            ], 422);
        }

        $validated = $request->validate([
            'comentario' => 'nullable|string',
        ]);

        // Usar la firma pre-cargada del usuario (supervisores/revisores)
        $firmaUrl = $request->user()->firma_imagen;

        if (!$firmaUrl) {
            return response()->json([
                'message' => 'Debes configurar tu firma digital en tu Perfil antes de poder aprobar documentos.',
            ], 422);
        }

        $aprobacion->update([
            'usuario_id' => $request->user()->id,
            'estado' => 'firmado',
            'firma' => $firmaUrl,
            'comentario' => $validated['comentario'] ?? null,
            'fecha' => now(),
        ]);

        // Verificar si todas las aprobaciones están firmadas
        $respuesta = $aprobacion->respuesta;
        $pendientes = $respuesta->aprobaciones()
            ->where('estado', '!=', 'firmado')
            ->count();

        if ($pendientes === 0) {
            $respuesta->update(['estado_general' => 'aprobado']);
        } else {
            $respuesta->update(['estado_general' => 'en_proceso']);
        }

        return response()->json([
            'message' => __('messages.approval_signed'),
            'data' => $aprobacion->load(['rolFirma', 'usuario:id,name']),
        ]);
    }

    /**
     * Rechazar una aprobación.
     */
    public function rechazar(Request $request, Aprobacion $aprobacion): JsonResponse
    {
        if ($aprobacion->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Esta aprobación ya fue procesada.',
            ], 422);
        }

        $validated = $request->validate([
            'comentario' => 'required|string|max:1000',
        ]);

        $aprobacion->update([
            'usuario_id' => $request->user()->id,
            'estado' => 'rechazado',
            'comentario' => $validated['comentario'],
            'fecha' => now(),
        ]);

        // Marcar la respuesta como rechazada
        $aprobacion->respuesta->update(['estado_general' => 'rechazado']);

        return response()->json([
            'message' => __('messages.approval_rejected'),
            'data' => $aprobacion->load(['rolFirma', 'usuario:id,name']),
        ]);
    }
}
