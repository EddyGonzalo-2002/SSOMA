<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    /**
     * Listar usuarios.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()->with('roles');

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('buscar')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->buscar}%")
                  ->orWhere('email', 'like', "%{$request->buscar}%")
                  ->orWhere('dni', 'like', "%{$request->buscar}%");
            });
        }

        if ($request->has('proyecto_id')) {
            $query->whereHas('proyectos', function ($q) use ($request) {
                $q->where('proyectos.id', $request->proyecto_id);
            });
        }

        if ($request->has('rol')) {
            $query->role($request->rol);
        }

        $users = $query->orderBy('name')
                       ->paginate($request->per_page ?? 15);

        return UserResource::collection($users);
    }

    /**
     * Crear usuario.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'dni' => 'nullable|string|max:20|unique:users',
            'telefono' => 'nullable|string|max:20',
            'cargo' => 'nullable|string|max:100',
            'estado' => 'nullable|in:activo,inactivo',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user = User::create($validated);

        if (!empty($validated['roles'])) {
            $user->assignRole($validated['roles']);
        }

        return response()->json([
            'message' => __('messages.created', ['resource' => 'Usuario']),
            'data' => new UserResource($user->load('roles')),
        ], 201);
    }

    /**
     * Ver detalle de un usuario.
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['roles', 'proyectos', 'areas']);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Actualizar usuario.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => "sometimes|required|string|email|max:255|unique:users,email,{$user->id}",
            'password' => 'nullable|string|min:8',
            'dni' => "nullable|string|max:20|unique:users,dni,{$user->id}",
            'telefono' => 'nullable|string|max:20',
            'cargo' => 'nullable|string|max:100',
            'estado' => 'nullable|in:activo,inactivo',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        // Solo actualizar password si viene
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return response()->json([
            'message' => __('messages.updated', ['resource' => 'Usuario']),
            'data' => new UserResource($user->load('roles')),
        ]);
    }

    /**
     * Eliminar usuario (soft delete).
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => __('messages.deleted', ['resource' => 'Usuario']),
        ]);
    }

    /**
     * Subir firma del usuario (supervisores/revisores).
     */
    public function subirFirma(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'firma' => 'required|string', // base64 string
        ]);

        $base64Image = $request->firma;

        // Check if string contains base64 format info (e.g. data:image/png;base64,...)
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if (!in_array($type, ['jpg', 'jpeg', 'png'])) {
                return response()->json(['message' => 'Invalid image type'], 422);
            }
        } else {
            return response()->json(['message' => 'Invalid base64 string'], 422);
        }

        $image = base64_decode($base64Image);
        
        if ($image === false) {
            return response()->json(['message' => 'Base64 decode failed'], 422);
        }

        $fileName = 'firmas/firma_' . $user->id . '_' . time() . '.' . $type;
        \Illuminate\Support\Facades\Storage::disk('public')->put($fileName, $image);

        $user->update(['firma_imagen' => $fileName]);

        return response()->json([
            'message' => __('messages.signature_uploaded'),
            'firma_url' => asset('storage/' . $fileName),
        ]);
    }
}
