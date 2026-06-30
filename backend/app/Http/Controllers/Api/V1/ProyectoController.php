<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProyectoResource;
use App\Models\Proyecto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProyectoController extends Controller
{
    /**
     * Listar todos los proyectos del usuario.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Proyecto::query()
            ->withCount(['areas', 'formularios', 'actividades', 'respuestas', 'usuarios'])
            ->with(['usuarios:id,name', 'formularios:id,codigo,nombre,proyecto_id', 'actividades' => function ($q) {
                $q->with('formularios:id,codigo,nombre')->withCount('respuestas');
            }]);

        // Filtrar por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Búsqueda
        if ($request->has('buscar')) {
            $query->where(function ($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->buscar}%")
                  ->orWhere('codigo', 'like', "%{$request->buscar}%");
            });
        }

        // Si no es superadmin, solo mostrar proyectos asignados
        if (!$request->user()->hasRole('superadmin')) {
            $query->whereHas('usuarios', function ($q) use ($request) {
                $q->where('users.id', $request->user()->id);
            });
        }

        $proyectos = $query->orderBy('created_at', 'desc')
                           ->paginate($request->per_page ?? 15);

        return ProyectoResource::collection($proyectos);
    }

    /**
     * Crear nuevo proyecto.
     */
    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403, 'Solo el administrador global puede crear proyectos.');

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:50|unique:proyectos,codigo',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'nullable|string|max:255',
            'ruc' => 'nullable|string|max:11',
            'razon_social' => 'nullable|string|max:255',
            'actividad_economica' => 'nullable|string|max:255',
            'estado' => 'nullable|in:activo,inactivo,finalizado',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $proyecto = Proyecto::create($validated);

        // Asignar al creador como usuario del proyecto
        $proyecto->usuarios()->attach($request->user()->id);

        return response()->json([
            'message' => __('messages.created', ['resource' => 'Proyecto']),
            'data' => new ProyectoResource($proyecto->loadCount(['areas', 'formularios', 'respuestas', 'usuarios'])),
        ], 201);
    }

    /**
     * Ver detalle de un proyecto.
     */
    public function show(Proyecto $proyecto): JsonResponse
    {
        $proyecto->loadCount(['areas', 'formularios', 'respuestas', 'usuarios']);
        $proyecto->load([
            'areas' => fn($q) => $q->activo(),
            'usuarios:id,name,email',
            'formularios:id,nombre,codigo'
        ]);

        return response()->json([
            'data' => new ProyectoResource($proyecto),
        ]);
    }

    /**
     * Actualizar proyecto.
     */
    public function update(Request $request, Proyecto $proyecto): JsonResponse
    {
        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && $proyecto->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para editar este proyecto.'
            );
        }

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'codigo' => "sometimes|required|string|max:50|unique:proyectos,codigo,{$proyecto->id}",
            'descripcion' => 'nullable|string',
            'ubicacion' => 'nullable|string|max:255',
            'ruc' => 'nullable|string|max:11',
            'razon_social' => 'nullable|string|max:255',
            'actividad_economica' => 'nullable|string|max:255',
            'estado' => 'nullable|in:activo,inactivo,finalizado',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $proyecto->update($validated);

        return response()->json([
            'message' => __('messages.updated', ['resource' => 'Proyecto']),
            'data' => new ProyectoResource($proyecto),
        ]);
    }

    /**
     * Eliminar proyecto (soft delete).
     */
    public function destroy(Request $request, Proyecto $proyecto): JsonResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403, 'Solo el administrador global puede eliminar proyectos.');

        $proyecto->delete();

        return response()->json([
            'message' => __('messages.deleted', ['resource' => 'Proyecto']),
        ]);
    }

    /**
     * Asignar usuarios a un proyecto.
     */
    public function asignarUsuarios(Request $request, Proyecto $proyecto): JsonResponse
    {
        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && $proyecto->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para gestionar los usuarios de este proyecto.'
            );
        }

        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $proyecto->usuarios()->syncWithoutDetaching($validated['user_ids']);

        return response()->json([
            'message' => __('messages.users_assigned'),
        ]);
    }

    /**
     * Sincronizar todos los usuarios de un proyecto (reemplaza los existentes).
     */
    public function syncUsuarios(Request $request, Proyecto $proyecto): JsonResponse
    {
        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && $proyecto->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para gestionar los usuarios de este proyecto.'
            );
        }

        $validated = $request->validate([
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $proyecto->usuarios()->sync($validated['user_ids'] ?? []);

        return response()->json([
            'message' => 'Usuarios sincronizados correctamente.',
        ]);
    }

    /**
     * Sincronizar formularios a un proyecto.
     */
    public function syncFormularios(Request $request, Proyecto $proyecto): JsonResponse
    {
        if (!$request->user()->hasRole('superadmin')) {
            abort_unless(
                $request->user()->hasRole('admin') && $proyecto->usuarios()->where('users.id', $request->user()->id)->exists(),
                403,
                'No tienes permisos para gestionar los formularios de este proyecto.'
            );
        }

        $validated = $request->validate([
            'formulario_ids' => 'array',
            'formulario_ids.*' => 'exists:formularios,id',
        ]);

        // Quitar este proyecto a los formularios que ya no están en el array
        \App\Models\Formulario::where('proyecto_id', $proyecto->id)->update(['proyecto_id' => null]);

        // Asignar este proyecto a los nuevos formularios
        if (!empty($validated['formulario_ids'])) {
            \App\Models\Formulario::whereIn('id', $validated['formulario_ids'])
                ->update(['proyecto_id' => $proyecto->id]);
        }

        return response()->json([
            'message' => 'Formularios sincronizados correctamente.',
        ]);
    }
}
