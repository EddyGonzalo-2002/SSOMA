<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'dni' => 'nullable|string|max:20|unique:users',
            'telefono' => 'nullable|string|max:20',
            'cargo' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'dni' => $validated['dni'] ?? null,
            'telefono' => $validated['telefono'] ?? null,
            'cargo' => $validated['cargo'] ?? null,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => __('auth.registered'),
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Iniciar sesión.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if ($user->estado === 'inactivo') {
            throw ValidationException::withMessages([
                'email' => [__('auth.inactive')],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => __('auth.login_success'),
            'user' => new UserResource($user->load('roles', 'permissions')),
            'token' => $token,
        ]);
    }

    /**
     * Cerrar sesión (revocar token actual).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => __('auth.logout_success'),
        ]);
    }

    /**
     * Obtener usuario autenticado.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'permissions', 'proyectos', 'areas']);

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }
}
