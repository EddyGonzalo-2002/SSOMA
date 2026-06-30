<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Respuesta;
use App\Models\Formulario;
use App\Models\Aprobacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RespuestaController extends Controller
{
    /**
     * Listar respuestas (filtrables).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Respuesta::query()
            ->with([
                'formulario:id,nombre,codigo',
                'usuario:id,name,email',
                'proyecto:id,nombre,codigo',
            ]);

        if ($request->has('proyecto_id')) {
            $query->where('proyecto_id', $request->proyecto_id);
        }

        if ($request->has('formulario_id')) {
            $query->where('formulario_id', $request->formulario_id);
        }

        if ($request->has('estado_general')) {
            $query->where('estado_general', $request->estado_general);
        }

        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        // Si no es admin, solo sus respuestas o las de su proyecto
        if (!$request->user()->hasRole('admin')) {
            $query->where(function ($q) use ($request) {
                $q->where('usuario_id', $request->user()->id)
                  ->orWhereIn('proyecto_id', $request->user()->proyectos()->pluck('proyectos.id'));
            });
        }

        $respuestas = $query->orderBy('created_at', 'desc')
                            ->paginate($request->per_page ?? 15);

        return response()->json($respuestas);
    }

    /**
     * Crear una nueva respuesta (registro de campo).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'formulario_id' => 'required|exists:formularios,id',
            'proyecto_id' => 'required|exists:proyectos,id',
            'actividad_id' => 'nullable|exists:actividades,id',
            'area_id' => 'nullable|exists:areas,id',
            'uuid' => 'nullable|string|unique:respuestas,uuid',
            'fecha' => 'nullable|date',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'notas' => 'nullable|string',
            'datos' => 'nullable|array',

            // Detalles (respuestas a campos)
            'detalles' => 'nullable|array',
            'detalles.*.campo_id' => 'required_with:detalles|exists:campos,id',
            'detalles.*.valor' => 'nullable|string',
            'detalles.*.valor_archivo' => 'nullable|string',

            // Participantes (trabajadores)
            'participantes' => 'nullable|array',
            'participantes.*.nombre' => 'required_with:participantes|string|max:255',
            'participantes.*.dni' => 'required_with:participantes|string|max:20',
            'participantes.*.cargo' => 'nullable|string|max:100',
            'participantes.*.empresa' => 'nullable|string|max:255',
            'participantes.*.firma' => 'nullable|string', // base64

            // Datos adicionales (para formularios personalizados)
            'datos' => 'nullable|array',
        ]);

        $formulario = Formulario::findOrFail($validated['formulario_id']);

        // Validar requerimientos del formulario
        if ($formulario->requiere_geolocalizacion && empty($validated['latitud'])) {
            return response()->json([
                'message' => __('messages.geolocation_required'),
            ], 422);
        }

        if ($formulario->requiere_participantes && empty($validated['participantes'])) {
            return response()->json([
                'message' => __('messages.participants_required'),
            ], 422);
        }

        // Crear respuesta
        $respuesta = Respuesta::create([
            'uuid' => $validated['uuid'] ?? Str::uuid(),
            'formulario_id' => $validated['formulario_id'],
            'usuario_id' => $request->user()->id,
            'proyecto_id' => $validated['proyecto_id'],
            'actividad_id' => $validated['actividad_id'] ?? null,
            'area_id' => $validated['area_id'] ?? null,
            'estado_general' => 'pendiente',
            'fecha' => $validated['fecha'] ?? now(),
            'latitud' => $validated['latitud'] ?? null,
            'longitud' => $validated['longitud'] ?? null,
            'notas' => $validated['notas'] ?? null,
            'datos' => $validated['datos'] ?? null,
        ]);

        // Guardar detalles
        if (!empty($validated['detalles'])) {
            foreach ($validated['detalles'] as $detalle) {
                $respuesta->detalles()->create($detalle);
            }
        }

        // Guardar participantes
        if (!empty($validated['participantes'])) {
            foreach ($validated['participantes'] as $participante) {
                $respuesta->participantes()->create(array_merge($participante, [
                    'fecha' => now(),
                ]));
            }
        }

        // Crear aprobaciones pendientes basadas en roles de firma
        $rolesFirma = $formulario->rolesFirma()->orderBy('orden')->get();
        foreach ($rolesFirma as $rolFirma) {
            $respuesta->aprobaciones()->create([
                'rol_firma_id' => $rolFirma->id,
                'estado' => 'pendiente',
            ]);
        }

        $respuesta->load(['detalles', 'participantes', 'aprobaciones.rolFirma']);

        return response()->json([
            'message' => __('messages.created', ['resource' => 'Respuesta']),
            'data' => $respuesta,
        ], 201);
    }

    /**
     * Ver detalle completo de una respuesta.
     */
    public function show(Respuesta $respuesta): JsonResponse
    {
        $respuesta->load([
            'formulario.campos.opciones',
            'formulario.rolesFirma',
            'usuario:id,name,email,cargo',
            'proyecto:id,nombre,codigo,ruc,razon_social,actividad_economica',
            'actividad:id,nombre',
            'area:id,nombre',
            'detalles.campo',
            'participantes',
            'aprobaciones.rolFirma',
            'aprobaciones.usuario:id,name,cargo',
            'evidencias',
        ]);

        return response()->json([
            'data' => $respuesta,
        ]);
    }

    /**
     * Eliminar respuesta (solo borrador).
     */
    public function destroy(Respuesta $respuesta): JsonResponse
    {
        if ($respuesta->estado_general !== 'borrador') {
            return response()->json([
                'message' => 'Solo se pueden eliminar respuestas en borrador.',
            ], 403);
        }

        $respuesta->delete();

        return response()->json([
            'message' => __('messages.deleted', ['resource' => 'Respuesta']),
        ]);
    }
}
