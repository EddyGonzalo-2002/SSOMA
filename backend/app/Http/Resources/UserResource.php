<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'dni' => $this->dni,
            'telefono' => $this->telefono,
            'cargo' => $this->cargo,
            'avatar' => $this->avatar,
            'firma_imagen' => $this->firma_imagen
                ? asset('storage/' . $this->firma_imagen)
                : null,
            'estado' => $this->estado,
            'roles' => $this->whenLoaded('roles', fn() =>
                $this->roles->pluck('name')
            ),
            'permissions' => $this->whenLoaded('permissions', fn() =>
                $this->getAllPermissions()->pluck('name')
            ),
            'proyectos' => ProyectoResource::collection(
                $this->whenLoaded('proyectos')
            ),
            'areas' => AreaResource::collection(
                $this->whenLoaded('areas')
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
