<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Formulario;
use App\Models\RolFirma;

class SstFor034Seeder extends Seeder
{
    public function run(): void
    {
        // 1. Create the Form
        $form = Formulario::create([
            'codigo' => 'SST-FOR-034',
            'nombre' => 'ANALISIS DE TRABAJO SEGURO (ATS)',
            'descripcion' => 'Formato para la identificación de peligros y evaluación de riesgos de la actividad a realizar.',
            'estado' => 'publicado',
            'requiere_participantes' => true, // To show the Asistentes table
        ]);

        // 3. Fields - Cabecera
        $form->campos()->createMany([
            ['etiqueta' => 'Especialidad', 'nombre_campo' => 'especialidad', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 1],
            ['etiqueta' => 'Hora de Inicio', 'nombre_campo' => 'hora_inicio', 'tipo' => 'time', 'obligatorio' => true, 'orden' => 2],
            ['etiqueta' => 'Hora Final', 'nombre_campo' => 'hora_final', 'tipo' => 'time', 'obligatorio' => false, 'orden' => 3],
        ]);

        // 4. Fields - Evaluación (12 questions)
        $evaluaciones = [
            '1.- ¿El RIESGO más crítico de la actividad fue identificado?',
            '2.- ¿Evaluó las condiciones del entorno de trabajo (Ej: Niveles de ruido, Espacio disponible...)?',
            '3.- ¿Identificó los Aspectos Ambientales (derrames, sustancias, etc)?',
            '4.- ¿Se identificó el EPP adecuado para la tarea y se encuentra en buen estado?',
            '5.- ¿El personal está capacitado para realizar la actividad?',
            '6.- ¿Se coordinó adecuadamente INTERFERENCIAS con otras actividades?',
            '7.- ¿Las herramientas, equipos e instalaciones eléctricas, están en condiciones de ser usadas?',
            '8.- ¿Evaluó la aplicación de bloqueos físicos requeridos para energías peligrosas?',
            '9.- ¿Evaluó el riesgo de incendio y vías de escape disponibles? ¿El área está limpia?',
            '10.- ¿Para trabajos en altura evaluó: escalas, accesos, líneas de vida, plataformas...?',
            '11.- ¿Los andamios se encuentran aprobados con tarjeta de color verde visible...?',
            '12.- ¿Para trabajos en caliente se cuenta con equipo de extinción de incendio...?'
        ];

        $opcionesSiNoNa = [
            ['etiqueta' => 'SI', 'valor' => 'SI'],
            ['etiqueta' => 'NO', 'valor' => 'NO'],
            ['etiqueta' => 'N/A', 'valor' => 'N/A'],
        ];

        foreach ($evaluaciones as $idx => $pregunta) {
            $campo = $form->campos()->create([
                'etiqueta' => $pregunta,
                'nombre_campo' => 'eval_' . ($idx + 1),
                'tipo' => 'select',
                'obligatorio' => true,
                'orden' => 3 + $idx + 1
            ]);
            $campo->opciones()->createMany($opcionesSiNoNa);
        }

        // 5. Permisos y Procedimientos
        $campoPermisos = $form->campos()->create([
            'etiqueta' => 'Procedimientos Especiales y Permisos Requeridos',
            'nombre_campo' => 'permisos_requeridos',
            'tipo' => 'multiselect',
            'obligatorio' => false,
            'orden' => 16
        ]);
        $campoPermisos->opciones()->createMany([
            ['etiqueta' => 'Permiso de Trabajo', 'valor' => 'Permiso de Trabajo'],
            ['etiqueta' => 'Procedimiento Específico', 'valor' => 'Procedimiento Especifico'],
            ['etiqueta' => 'Capacitación Específica', 'valor' => 'Capacitacion Especifica'],
            ['etiqueta' => 'Hojas de SDS', 'valor' => 'Hojas de SDS'],
            ['etiqueta' => 'Equipo de Protección Colectiva', 'valor' => 'Equipo de Proteccion Colectiva'],
            ['etiqueta' => 'Otros', 'valor' => 'Otros'],
        ]);

        // 6. ATS Table (14 rows)
        // Only making the first row required to ensure they fill at least one.
        for ($i = 1; $i <= 14; $i++) {
            $req = ($i === 1);
            $form->campos()->createMany([
                ['etiqueta' => "Fila $i - Secuencia de la Tarea", 'nombre_campo' => "ats_seq_$i", 'tipo' => 'text', 'obligatorio' => $req, 'orden' => 16 + ($i * 4) - 3],
                ['etiqueta' => "Fila $i - Peligros", 'nombre_campo' => "ats_pel_$i", 'tipo' => 'text', 'obligatorio' => $req, 'orden' => 16 + ($i * 4) - 2],
                ['etiqueta' => "Fila $i - Riesgos/Consecuencias", 'nombre_campo' => "ats_rie_$i", 'tipo' => 'text', 'obligatorio' => $req, 'orden' => 16 + ($i * 4) - 1],
                ['etiqueta' => "Fila $i - Medidas de Control", 'nombre_campo' => "ats_ctrl_$i", 'tipo' => 'textarea', 'obligatorio' => $req, 'orden' => 16 + ($i * 4)],
            ]);
        }

        // 7. Roles de Firma
        $form->rolesFirma()->createMany([
            ['rol' => 'jefe_grupo_capataz', 'nombre_display' => 'Jefe de Grupo o Capataz', 'orden' => 1],
            ['rol' => 'ing_residente', 'nombre_display' => 'Ing. Jefe Campo y/o Residente de Obra', 'orden' => 2],
            ['rol' => 'supervisor_ssoma', 'nombre_display' => 'Jefe y/o Supervisor SSOMA', 'orden' => 3],
        ]);
    }
}
