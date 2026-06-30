<?php

use App\Models\Formulario;
use App\Models\Proyecto;
use App\Models\Respuesta;
use Illuminate\Support\Str;

$form = Formulario::where('codigo', 'SST-FOR-067')->first();
$proyecto = Proyecto::where('nombre', 'like', '%SMART%')->first();
$user = \App\Models\User::first();

if (!$form || !$proyecto) {
    echo "Formulario o Proyecto no encontrado.\n";
    exit;
}

// Crear respuesta
$respuesta = Respuesta::create([
    'uuid' => Str::uuid(),
    'formulario_id' => $form->id,
    'usuario_id' => $user->id,
    'proyecto_id' => $proyecto->id,
    'estado_general' => 'pendiente',
    'fecha' => now(), // Cannot be null
]);

$detalles = [
    'razon_social' => 'TACTICAL IT',
    'ruc' => '20545316561',
    'actividad_economica' => 'Actividades de arquitectura e ingeniería y comunicaciones',
    'lugar_empleador' => 'LIMA',
    'num_trabajadores' => '',
    'lugar_capacitacion' => '',
    'capacitadores' => '',
    'tipo_actividad' => '',
    'hora_inicio' => '',
    'hora_termino' => '',
    'num_horas' => '',
    'num_participantes' => '',
    'tema_1' => '',
    'tema_2' => '',
    'tema_3' => '',
];

foreach ($form->campos as $campo) {
    $valor = $detalles[$campo->nombre_campo] ?? '';
    $respuesta->detalles()->create([
        'campo_id' => $campo->id,
        'valor' => $valor,
    ]);
}

// Roles de firma
$rolesFirma = $form->rolesFirma()->orderBy('orden')->get();
foreach ($rolesFirma as $rolFirma) {
    $respuesta->aprobaciones()->create([
        'rol_firma_id' => $rolFirma->id,
        'estado' => 'pendiente',
    ]);
}

echo "Respuesta creada con ID: " . $respuesta->id . "\n";
