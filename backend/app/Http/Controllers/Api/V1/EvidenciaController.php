<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Evidencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvidenciaController extends Controller
{
    /**
     * Subir evidencia (foto/documento/video) a una respuesta.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'respuesta_id' => 'required|exists:respuestas,id',
            'archivo' => 'required|file|max:20480', // Max 20MB
            'tipo' => 'required|in:foto,documento,video',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
        ]);

        $archivo = $request->file('archivo');
        $path = $archivo->store('evidencias/' . $validated['tipo'], 'public');

        $evidencia = Evidencia::create([
            'respuesta_id' => $validated['respuesta_id'],
            'url' => $path,
            'nombre_archivo' => $archivo->getClientOriginalName(),
            'tipo' => $validated['tipo'],
            'mime_type' => $archivo->getMimeType(),
            'tamano_bytes' => $archivo->getSize(),
            'usuario_id' => $request->user()->id,
            'latitud' => $validated['latitud'] ?? null,
            'longitud' => $validated['longitud'] ?? null,
        ]);

        return response()->json([
            'message' => 'Evidencia subida exitosamente.',
            'data' => $evidencia,
            'url' => asset('storage/' . $path),
        ], 201);
    }

    /**
     * Listar evidencias de una respuesta.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'respuesta_id' => 'required|exists:respuestas,id',
        ]);

        $evidencias = Evidencia::where('respuesta_id', $request->respuesta_id)
            ->with('usuario:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $evidencias,
        ]);
    }

    /**
     * Eliminar evidencia.
     */
    public function destroy(Evidencia $evidencia): JsonResponse
    {
        $evidencia->delete();

        return response()->json([
            'message' => 'Evidencia eliminada exitosamente.',
        ]);
    }
}
