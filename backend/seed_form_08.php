<?php

use App\Models\Formulario;
use App\Models\Campo;

$form = Formulario::create([
    'nombre' => 'Check List de Inspección de Orden y Limpieza',
    'codigo' => 'FORMATO-08',
    'descripcion' => 'Inspección de orden y limpieza en áreas de trabajo',
    'estado' => 'publicado',
    'proyecto_id' => 1,
    'requiere_geolocalizacion' => false,
    'requiere_participantes' => false,
]);

$campos = [
    // Datos Generales
    ['etiqueta' => 'Área a evaluar', 'nombre_campo' => 'area_evaluar', 'tipo' => 'text', 'obligatorio' => true],
    ['etiqueta' => 'Inspector', 'nombre_campo' => 'inspector', 'tipo' => 'text', 'obligatorio' => true],
    
    // Organización
    ['etiqueta' => 'Org 1: Sin objetos inservibles', 'nombre_campo' => 'org_1', 'tipo' => 'select'],
    ['etiqueta' => 'Org 2: Sin objetos de otras áreas', 'nombre_campo' => 'org_2', 'tipo' => 'select'],
    ['etiqueta' => 'Org 3: Cantidades mínimas necesarias', 'nombre_campo' => 'org_3', 'tipo' => 'select'],
    ['etiqueta' => 'Org 4: Vías despejadas', 'nombre_campo' => 'org_4', 'tipo' => 'select'],
    
    // Orden
    ['etiqueta' => 'Ord 1: Objetos con ubicación definida', 'nombre_campo' => 'ord_1', 'tipo' => 'select'],
    ['etiqueta' => 'Ord 2: Ubicaciones rotuladas', 'nombre_campo' => 'ord_2', 'tipo' => 'select'],
    ['etiqueta' => 'Ord 3: Vías identificadas y señalizadas', 'nombre_campo' => 'ord_3', 'tipo' => 'select'],
    ['etiqueta' => 'Ord 4: Áreas identificadas', 'nombre_campo' => 'ord_4', 'tipo' => 'select'],
    ['etiqueta' => 'Ord 5: Paneles ordenados', 'nombre_campo' => 'ord_5', 'tipo' => 'select'],

    // Limpieza
    ['etiqueta' => 'Lim 1: Área limpia y libre de aceite', 'nombre_campo' => 'lim_1', 'tipo' => 'select'],
    ['etiqueta' => 'Lim 2: Lugares para residuos', 'nombre_campo' => 'lim_2', 'tipo' => 'select'],
    ['etiqueta' => 'Lim 3: Plan de limpieza y elementos', 'nombre_campo' => 'lim_3', 'tipo' => 'select'],
    ['etiqueta' => 'Lim 4: Infraestructuras en buen estado', 'nombre_campo' => 'lim_4', 'tipo' => 'select'],
];

$opciones = [
    ['valor' => 'NA', 'etiqueta' => 'NA'],
    ['valor' => 'NC', 'etiqueta' => 'NC (0%)'],
    ['valor' => 'CP', 'etiqueta' => 'CP (50%)'],
    ['valor' => 'CT', 'etiqueta' => 'CT (100%)'],
];

$orden = 1;
foreach ($campos as $c) {
    Campo::create([
        'formulario_id' => $form->id,
        'etiqueta' => $c['etiqueta'],
        'nombre_campo' => $c['nombre_campo'],
        'tipo' => $c['tipo'],
        'obligatorio' => $c['obligatorio'] ?? false,
        'orden' => $orden++,
        'opciones' => $c['tipo'] === 'select' ? $opciones : null,
    ]);
}

echo "Formulario creado con ID: " . $form->id . PHP_EOL;
