<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AreaResource;
use App\Models\Area;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AreaController extends Controller
{
    /**
     * Listar áreas (filtrable por proyecto).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Area::query()->with('proyecto');

        if ($request->has('proyecto_id')) {
            $query->where('proyecto_id', $request->proyecto_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('buscar')) {
            $query->where(function ($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->buscar}%")
                  ->orWhere('codigo', 'like', "%{$request->buscar}%");
            });
        }

        $user = $request->user();
        if (!$user->hasRole('superadmin')) {
            if ($user->hasRole('admin')) {
                // Admin (Residente) ve áreas de los proyectos que administra
                $query->whereHas('proyecto.usuarios', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
            } else {
                // Supervisor y otros ven solo las áreas asignadas directamente
                $query->whereHas('usuarios', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
            }
        }

        $areas = $query->withCount(['formularios', 'usuarios'])
                       ->orderBy('nombre')
                       ->paginate($request->per_page ?? 15);

        return AreaResource::collection($areas);
    }

    /**
     * Crear nueva área.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'proyecto_id' => 'required|exists:proyectos,id',
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && \App\Models\Proyecto::find($validated['proyecto_id'])->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para crear áreas en este proyecto.'
            );
        }

        $area = Area::create($validated);

        return response()->json([
            'message' => __('messages.created', ['resource' => 'Área']),
            'data' => new AreaResource($area->load('proyecto')),
        ], 201);
    }

    /**
     * Ver detalle de un área.
     */
    public function show(Area $area): JsonResponse
    {
        $area->load('proyecto');
        $area->loadCount(['formularios', 'usuarios']);

        return response()->json([
            'data' => new AreaResource($area),
        ]);
    }

    /**
     * Actualizar área.
     */
    public function update(Request $request, Area $area): JsonResponse
    {
        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && $area->proyecto->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para editar esta área.'
            );
        }

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'codigo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        $area->update($validated);

        return response()->json([
            'message' => __('messages.updated', ['resource' => 'Área']),
            'data' => new AreaResource($area),
        ]);
    }

    /**
     * Eliminar área (soft delete).
     */
    public function destroy(Request $request, Area $area): JsonResponse
    {
        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && $area->proyecto->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para eliminar esta área.'
            );
        }

        $area->delete();

        return response()->json([
            'message' => __('messages.deleted', ['resource' => 'Área']),
        ]);
    }

    /**
     * Asignar usuarios a un área.
     */
    public function asignarUsuarios(Request $request, Area $area): JsonResponse
    {
        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && $area->proyecto->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para asignar usuarios a esta área.'
            );
        }

        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $area->usuarios()->syncWithoutDetaching($validated['user_ids']);

        return response()->json([
            'message' => __('messages.users_assigned'),
        ]);
    }
}
