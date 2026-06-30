<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use App\Models\Campo;
use App\Models\OpcionCampo;
use App\Models\RolFirma;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FormularioController extends Controller
{
    /**
     * Listar formularios (filtrables por proyecto/área).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Formulario::query()
            ->with(['proyecto:id,nombre,codigo', 'area:id,nombre,codigo'])
            ->withCount(['campos', 'respuestas', 'rolesFirma']);

        if ($request->has('proyecto_id')) {
            $query->where('proyecto_id', $request->proyecto_id);
        }

        if ($request->has('area_id')) {
            $query->where('area_id', $request->area_id);
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
                // Admin (Residente) ve formularios de sus proyectos
                $query->whereHas('proyecto.usuarios', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
            } else {
                // Supervisor y otros ven formularios de su área, o de su proyecto si el formulario no tiene área
                $query->where(function ($q) use ($user) {
                    $q->whereHas('area.usuarios', function ($sq) use ($user) {
                        $sq->where('users.id', $user->id);
                    })->orWhere(function ($sq) use ($user) {
                        $sq->whereNull('area_id')
                           ->whereHas('proyecto.usuarios', function ($ssq) use ($user) {
                               $ssq->where('users.id', $user->id);
                           });
                    });
                });
            }
        }

        $formularios = $query->orderBy('created_at', 'desc')
                             ->paginate($request->per_page ?? 15);

        return response()->json($formularios);
    }

    /**
     * Crear formulario con campos y roles de firma.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:50|unique:formularios,codigo',
            'descripcion' => 'nullable|string',
            'proyecto_id' => 'required|exists:proyectos,id',
            'area_id' => 'nullable|exists:areas,id',
            'requiere_participantes' => 'nullable|boolean',
            'requiere_geolocalizacion' => 'nullable|boolean',
            'estado' => 'nullable|in:borrador,publicado,archivado',

            // Campos
            'campos' => 'nullable|array',
            'campos.*.etiqueta' => 'required_with:campos|string|max:255',
            'campos.*.nombre_campo' => 'required_with:campos|string|max:100',
            'campos.*.tipo' => 'required_with:campos|string|in:text,textarea,number,date,time,datetime,select,multiselect,checkbox,radio,foto,firma,archivo,seccion,geolocalizacion',
            'campos.*.obligatorio' => 'nullable|boolean',
            'campos.*.orden' => 'nullable|integer',
            'campos.*.placeholder' => 'nullable|string',
            'campos.*.valor_defecto' => 'nullable|string',
            'campos.*.validaciones' => 'nullable|array',
            'campos.*.configuracion' => 'nullable|array',
            'campos.*.opciones' => 'nullable|array',
            'campos.*.opciones.*.valor' => 'required_with:campos.*.opciones|string',
            'campos.*.opciones.*.etiqueta' => 'required_with:campos.*.opciones|string',

            // Roles de firma
            'roles_firma' => 'nullable|array',
            'roles_firma.*.rol' => 'required_with:roles_firma|string|max:100',
            'roles_firma.*.nombre_display' => 'required_with:roles_firma|string|max:255',
            'roles_firma.*.orden' => 'nullable|integer',
            'roles_firma.*.obligatorio' => 'nullable|boolean',
        ]);

        $formulario = Formulario::create([
            'nombre' => $validated['nombre'],
            'codigo' => $validated['codigo'],
            'descripcion' => $validated['descripcion'] ?? null,
            'proyecto_id' => $validated['proyecto_id'],
            'area_id' => $validated['area_id'] ?? null,
            'requiere_participantes' => $validated['requiere_participantes'] ?? false,
            'requiere_geolocalizacion' => $validated['requiere_geolocalizacion'] ?? false,
            'estado' => $validated['estado'] ?? 'borrador',
        ]);

        // Crear campos
        if (!empty($validated['campos'])) {
            foreach ($validated['campos'] as $index => $campoData) {
                $campo = $formulario->campos()->create([
                    'etiqueta' => $campoData['etiqueta'],
                    'nombre_campo' => $campoData['nombre_campo'],
                    'tipo' => $campoData['tipo'],
                    'obligatorio' => $campoData['obligatorio'] ?? false,
                    'orden' => $campoData['orden'] ?? $index,
                    'placeholder' => $campoData['placeholder'] ?? null,
                    'valor_defecto' => $campoData['valor_defecto'] ?? null,
                    'validaciones' => $campoData['validaciones'] ?? null,
                    'configuracion' => $campoData['configuracion'] ?? null,
                ]);

                // Crear opciones del campo
                if (!empty($campoData['opciones'])) {
                    foreach ($campoData['opciones'] as $opIndex => $opcion) {
                        $campo->opciones()->create([
                            'valor' => $opcion['valor'],
                            'etiqueta' => $opcion['etiqueta'],
                            'orden' => $opcion['orden'] ?? $opIndex,
                        ]);
                    }
                }
            }
        }

        // Crear roles de firma
        if (!empty($validated['roles_firma'])) {
            foreach ($validated['roles_firma'] as $index => $rolData) {
                $formulario->rolesFirma()->create([
                    'rol' => $rolData['rol'],
                    'nombre_display' => $rolData['nombre_display'],
                    'orden' => $rolData['orden'] ?? $index,
                    'obligatorio' => $rolData['obligatorio'] ?? true,
                ]);
            }
        }

        $formulario->load(['campos.opciones', 'rolesFirma']);

        return response()->json([
            'message' => __('messages.created', ['resource' => 'Formulario']),
            'data' => $formulario,
        ], 201);
    }

    /**
     * Ver formulario con campos completos.
     */
    public function show(Formulario $formulario): JsonResponse
    {
        $formulario->load([
            'proyecto:id,nombre,codigo',
            'area:id,nombre,codigo',
            'campos' => fn($q) => $q->orderBy('orden'),
            'campos.opciones' => fn($q) => $q->orderBy('orden'),
            'rolesFirma' => fn($q) => $q->orderBy('orden'),
        ]);

        $formulario->loadCount(['respuestas']);

        return response()->json([
            'data' => $formulario,
        ]);
    }

    /**
     * Actualizar formulario.
     */
    public function update(Request $request, Formulario $formulario): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'codigo' => "sometimes|required|string|max:50|unique:formularios,codigo,{$formulario->id}",
            'descripcion' => 'nullable|string',
            'area_id' => 'nullable|exists:areas,id',
            'requiere_participantes' => 'nullable|boolean',
            'requiere_geolocalizacion' => 'nullable|boolean',
            'estado' => 'nullable|in:borrador,publicado,archivado',
        ]);

        $formulario->update($validated);

        return response()->json([
            'message' => __('messages.updated', ['resource' => 'Formulario']),
            'data' => $formulario,
        ]);
    }

    /**
     * Eliminar formulario.
     */
    public function destroy(Formulario $formulario): JsonResponse
    {
        $formulario->delete();

        return response()->json([
            'message' => __('messages.deleted', ['resource' => 'Formulario']),
        ]);
    }

    /**
     * Agregar/actualizar campos de un formulario.
     */
    public function syncCampos(Request $request, Formulario $formulario): JsonResponse
    {
        $validated = $request->validate([
            'campos' => 'required|array',
            'campos.*.id' => 'nullable|exists:campos,id',
            'campos.*.etiqueta' => 'required|string|max:255',
            'campos.*.nombre_campo' => 'required|string|max:100',
            'campos.*.tipo' => 'required|string',
            'campos.*.obligatorio' => 'nullable|boolean',
            'campos.*.orden' => 'nullable|integer',
            'campos.*.placeholder' => 'nullable|string',
            'campos.*.valor_defecto' => 'nullable|string',
            'campos.*.validaciones' => 'nullable|array',
            'campos.*.configuracion' => 'nullable|array',
            'campos.*.opciones' => 'nullable|array',
        ]);

        $campoIds = [];

        foreach ($validated['campos'] as $index => $campoData) {
            $campo = $formulario->campos()->updateOrCreate(
                ['id' => $campoData['id'] ?? null],
                [
                    'etiqueta' => $campoData['etiqueta'],
                    'nombre_campo' => $campoData['nombre_campo'],
                    'tipo' => $campoData['tipo'],
                    'obligatorio' => $campoData['obligatorio'] ?? false,
                    'orden' => $campoData['orden'] ?? $index,
                    'placeholder' => $campoData['placeholder'] ?? null,
                    'valor_defecto' => $campoData['valor_defecto'] ?? null,
                    'validaciones' => $campoData['validaciones'] ?? null,
                    'configuracion' => $campoData['configuracion'] ?? null,
                ]
            );
            $campoIds[] = $campo->id;

            // Sync opciones
            if (!empty($campoData['opciones'])) {
                $campo->opciones()->delete();
                foreach ($campoData['opciones'] as $opIndex => $opcion) {
                    $campo->opciones()->create([
                        'valor' => $opcion['valor'],
                        'etiqueta' => $opcion['etiqueta'],
                        'orden' => $opcion['orden'] ?? $opIndex,
                    ]);
                }
            }
        }

        // Eliminar campos que no están en la lista
        $formulario->campos()->whereNotIn('id', $campoIds)->delete();

        $formulario->load(['campos.opciones']);

        return response()->json([
            'message' => 'Campos actualizados exitosamente.',
            'data' => $formulario,
        ]);
    }
}
