<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AreaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'proyecto_id' => $this->proyecto_id,
            'nombre' => $this->nombre,
            'codigo' => $this->codigo,
            'descripcion' => $this->descripcion,
            'estado' => $this->estado,

            // Contadores
            'formularios_count' => $this->whenCounted('formularios'),
            'usuarios_count' => $this->whenCounted('usuarios'),

            // Relaciones
            'proyecto' => new ProyectoResource($this->whenLoaded('proyecto')),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
