<?php

use App\Models\Formulario;

$form = Formulario::where('codigo', 'SST-FOR-067')->first();

if ($form) {
    // Limpiar campos existentes
    $form->campos()->delete();

    $campos = [
        // DATOS DEL EMPLEADOR
        ['etiqueta' => 'Razón Social', 'nombre_campo' => 'razon_social', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 1],
        ['etiqueta' => 'RUC', 'nombre_campo' => 'ruc', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 2],
        ['etiqueta' => 'Actividad Económica', 'nombre_campo' => 'actividad_economica', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 3],
        ['etiqueta' => 'Lugar (Sede Principal)', 'nombre_campo' => 'lugar_empleador', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 4],
        ['etiqueta' => 'N° de Trabajadores Total', 'nombre_campo' => 'num_trabajadores', 'tipo' => 'number', 'obligatorio' => true, 'orden' => 5],

        // DATOS GENERALES
        ['etiqueta' => 'Lugar de Capacitación', 'nombre_campo' => 'lugar_capacitacion', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 6],
        ['etiqueta' => 'Nombre del (los) Capacitador(es) o Entrenador(es)', 'nombre_campo' => 'capacitadores', 'tipo' => 'textarea', 'obligatorio' => true, 'orden' => 7],

        // TIPO
        ['etiqueta' => 'Tipo de Actividad', 'nombre_campo' => 'tipo_actividad', 'tipo' => 'select', 'obligatorio' => true, 'orden' => 8],
        ['etiqueta' => 'Hora de Inicio', 'nombre_campo' => 'hora_inicio', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 9],
        ['etiqueta' => 'Hora de Término', 'nombre_campo' => 'hora_termino', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 10],
        ['etiqueta' => 'N° de Horas', 'nombre_campo' => 'num_horas', 'tipo' => 'number', 'obligatorio' => true, 'orden' => 11],
        ['etiqueta' => 'N° de Participantes', 'nombre_campo' => 'num_participantes', 'tipo' => 'number', 'obligatorio' => true, 'orden' => 12],

        // TEMAS ESPECIFICOS
        ['etiqueta' => 'Tema Específico 1', 'nombre_campo' => 'tema_1', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 13],
        ['etiqueta' => 'Tema Específico 2', 'nombre_campo' => 'tema_2', 'tipo' => 'text', 'obligatorio' => false, 'orden' => 14],
        ['etiqueta' => 'Tema Específico 3', 'nombre_campo' => 'tema_3', 'tipo' => 'text', 'obligatorio' => false, 'orden' => 15],
    ];

    foreach ($campos as $campo) {
        $c = $form->campos()->create($campo);
        
        if ($campo['nombre_campo'] === 'tipo_actividad') {
            $c->opciones()->createMany([
                ['etiqueta' => 'Inducción', 'valor' => 'Inducción'],
                ['etiqueta' => 'Capacitación', 'valor' => 'Capacitación'],
                ['etiqueta' => 'Entrenamiento', 'valor' => 'Entrenamiento'],
                ['etiqueta' => 'Charla 5 minutos', 'valor' => 'Charla 5 minutos'],
                ['etiqueta' => 'Simulacro de Emergencia', 'valor' => 'Simulacro de Emergencia'],
                ['etiqueta' => 'Otros', 'valor' => 'Otros'],
            ]);
        }
    }

    echo "Formulario SST-FOR-067 actualizado correctamente.\n";
} else {
    echo "Formulario no encontrado.\n";
}
