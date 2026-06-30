<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProyectoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'codigo' => $this->codigo,
            'descripcion' => $this->descripcion,
            'ubicacion' => $this->ubicacion,
            'ruc' => $this->ruc,
            'razon_social' => $this->razon_social,
            'actividad_economica' => $this->actividad_economica,
            'estado' => $this->estado,
            'fecha_inicio' => $this->fecha_inicio?->format('Y-m-d'),
            'fecha_fin' => $this->fecha_fin?->format('Y-m-d'),

            // Contadores (cuando están cargados)
            'areas_count' => $this->whenCounted('areas'),
            'formularios_count' => $this->whenCounted('formularios'),
            'actividades_count' => $this->whenCounted('actividades'),
            'respuestas_count' => $this->whenCounted('respuestas'),
            'usuarios_count' => $this->whenCounted('usuarios'),

            // Relaciones opcionales
            'areas' => AreaResource::collection($this->whenLoaded('areas')),
            'usuarios' => $this->whenLoaded('usuarios'),
            'formularios' => $this->whenLoaded('formularios'),
            'actividades' => $this->whenLoaded('actividades'),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
