<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Area;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActividadController extends Controller
{
    /**
     * Listar actividades de un area.
     */
    public function index(Request $request, Area $area): JsonResponse
    {
        $query = $area->actividades()
            ->withCount(['formularios', 'respuestas'])
            ->with('formularios:id,nombre,codigo');

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('buscar')) {
            $query->where('nombre', 'like', "%{$request->buscar}%");
        }

        $actividades = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $actividades,
        ]);
    }

    /**
     * Crear nueva actividad en un area.
     */
    public function store(Request $request, Area $area): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activa,completada,cancelada',
            'fecha_programada' => 'nullable|date',
            'formulario_ids' => 'array',
            'formulario_ids.*' => 'exists:formularios,id',
        ]);

        $actividad = $area->actividades()->create([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'estado' => $validated['estado'] ?? 'activa',
            'fecha_programada' => $validated['fecha_programada'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        // Vincular formularios
        if (!empty($validated['formulario_ids'])) {
            $actividad->formularios()->sync($validated['formulario_ids']);
        }

        $actividad->load('formularios:id,nombre,codigo');
        $actividad->loadCount(['formularios', 'respuestas']);

        return response()->json([
            'message' => 'Actividad creada correctamente.',
            'data' => $actividad,
        ], 201);
    }

    /**
     * Ver detalle de una actividad.
     */
    public function show(Area $area, Actividad $actividad): JsonResponse
    {
        $actividad->load('formularios:id,nombre,codigo');
        $actividad->loadCount(['formularios', 'respuestas']);

        return response()->json([
            'data' => $actividad,
        ]);
    }

    /**
     * Actualizar actividad.
     */
    public function update(Request $request, Area $area, Actividad $actividad): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activa,completada,cancelada',
            'fecha_programada' => 'nullable|date',
            'formulario_ids' => 'array',
            'formulario_ids.*' => 'exists:formularios,id',
        ]);

        $actividad->update([
            'nombre' => $validated['nombre'] ?? $actividad->nombre,
            'descripcion' => $validated['descripcion'] ?? $actividad->descripcion,
            'estado' => $validated['estado'] ?? $actividad->estado,
            'fecha_programada' => $validated['fecha_programada'] ?? $actividad->fecha_programada,
        ]);

        // Sync formularios if provided
        if (array_key_exists('formulario_ids', $validated)) {
            $actividad->formularios()->sync($validated['formulario_ids'] ?? []);
        }

        $actividad->load('formularios:id,nombre,codigo');
        $actividad->loadCount(['formularios', 'respuestas']);

        return response()->json([
            'message' => 'Actividad actualizada correctamente.',
            'data' => $actividad,
        ]);
    }

    /**
     * Eliminar actividad (soft delete).
     */
    public function destroy(Area $area, Actividad $actividad): JsonResponse
    {
        $actividad->delete();

        return response()->json([
            'message' => 'Actividad eliminada correctamente.',
        ]);
    }
}
