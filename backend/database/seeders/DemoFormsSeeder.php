<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Formulario;
use App\Models\Campo;
use App\Models\RolFirma;

class DemoFormsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ATS (Análisis de Trabajo Seguro)
        $ats = Formulario::updateOrCreate(
            ['codigo' => 'SST-FOR-034'],
            [
                'proyecto_id' => 1,
                'nombre' => 'ATS - Análisis de Trabajo Seguro',
                'descripcion' => 'Formato para evaluar riesgos antes de iniciar una labor (SST-FOR-034).',
                'estado' => 'publicado',
                'requiere_geolocalizacion' => true,
                'requiere_participantes' => true,
            ]
        );

        if ($ats->wasRecentlyCreated) {
            $camposAts = [
                ['etiqueta' => 'Trabajo o Actividad a realizar', 'nombre_campo' => 'actividad', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 1],
                ['etiqueta' => 'Sector de Trabajo', 'nombre_campo' => 'sector', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 2],
                ['etiqueta' => 'Especialidad', 'nombre_campo' => 'especialidad', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 3],
                ['etiqueta' => 'Secuencia de la Tarea 1', 'nombre_campo' => 'tarea_1', 'tipo' => 'textarea', 'obligatorio' => true, 'orden' => 4],
                ['etiqueta' => 'Peligros y Riesgos 1', 'nombre_campo' => 'riesgo_1', 'tipo' => 'textarea', 'obligatorio' => true, 'orden' => 5],
                ['etiqueta' => 'Medidas de Control 1', 'nombre_campo' => 'control_1', 'tipo' => 'textarea', 'obligatorio' => true, 'orden' => 6],
                ['etiqueta' => 'Evidencia Fotográfica del Área', 'nombre_campo' => 'foto_area', 'tipo' => 'foto', 'obligatorio' => false, 'orden' => 7],
            ];

            foreach ($camposAts as $campo) {
                $ats->campos()->create($campo);
            }

            $ats->rolesFirma()->create(['rol' => 'prevencionista', 'nombre_display' => 'Prevencionista de Riesgos', 'orden' => 1]);
            $ats->rolesFirma()->create(['rol' => 'supervisor', 'nombre_display' => 'Supervisor de Obra', 'orden' => 2]);
        }


        // 2. Inspección de Extintores
        $extintores = Formulario::updateOrCreate(
            ['codigo' => 'SST-FOR-017'],
            [
                'proyecto_id' => 1,
                'nombre' => 'Checklist de Inspección de Extintores',
                'descripcion' => 'Inspección mensual de equipos contra incendio (SST-FOR-017).',
                'estado' => 'publicado',
                'requiere_geolocalizacion' => true,
                'requiere_participantes' => false,
            ]
        );

        if ($extintores->wasRecentlyCreated) {
            // No se crean campos dinámicos ya que SST-FOR-017 usa una vista personalizada.
            $extintores->rolesFirma()->create(['rol' => 'prevencionista', 'nombre_display' => 'Revisión por Prevencionista', 'orden' => 1]);
        }


        // 3. Registro de Capacitación SST
        $capacitacion = Formulario::updateOrCreate(
            ['codigo' => 'SST-FOR-067'],
            [
                'proyecto_id' => 1,
                'nombre' => 'Registro para Actividades de SST',
                'descripcion' => 'Control de asistencia a inducciones, charlas de 5 min y capacitaciones (SST-FOR-067).',
                'estado' => 'publicado',
                'requiere_geolocalizacion' => false,
                'requiere_participantes' => true,
            ]
        );

        if ($capacitacion->wasRecentlyCreated) {
            $camposCap = [
                ['etiqueta' => 'Tipo de Actividad', 'nombre_campo' => 'tipo_actividad', 'tipo' => 'select', 'obligatorio' => true, 'orden' => 1],
                ['etiqueta' => 'Tema Específico', 'nombre_campo' => 'tema', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 2],
                ['etiqueta' => 'Hora de Inicio', 'nombre_campo' => 'hora_inicio', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 3],
                ['etiqueta' => 'Nombre del Capacitador', 'nombre_campo' => 'capacitador', 'tipo' => 'text', 'obligatorio' => true, 'orden' => 4],
            ];

            foreach ($camposCap as $campo) {
                $c = $capacitacion->campos()->create($campo);

                if ($campo['nombre_campo'] === 'tipo_actividad') {
                    $c->opciones()->createMany([
                        ['etiqueta' => 'Inducción', 'valor' => 'induccion'],
                        ['etiqueta' => 'Capacitación', 'valor' => 'capacitacion'],
                        ['etiqueta' => 'Entrenamiento', 'valor' => 'entrenamiento'],
                        ['etiqueta' => 'Charla 5 minutos', 'valor' => 'charla5'],
                        ['etiqueta' => 'Simulacro', 'valor' => 'simulacro'],
                    ]);
                }
            }

            $capacitacion->rolesFirma()->create(['rol' => 'prevencionista', 'nombre_display' => 'Aprobación del Supervisor SST', 'orden' => 1]);
        }

        // 4. FORMATO 05 - Check List de Inspección de Orden y Limpieza
        $formato05 = Formulario::updateOrCreate(
            ['codigo' => 'FORMATO-05'],
            [
                'proyecto_id' => 1,
                'nombre' => 'Check List de Inspección de Orden y Limpieza',
                'descripcion' => 'Evaluación de los criterios de organización, orden y limpieza en áreas de trabajo (FORMATO-05).',
                'estado' => 'publicado',
                'requiere_geolocalizacion' => false,
                'requiere_participantes' => false,
            ]
        );

        if ($formato05->wasRecentlyCreated) {
            $formato05->rolesFirma()->create(['rol' => 'prevencionista', 'nombre_display' => 'Revisado por SSOMA', 'orden' => 1]);
        }
    }
}
