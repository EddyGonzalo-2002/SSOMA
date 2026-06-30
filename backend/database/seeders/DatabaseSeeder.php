<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Proyecto;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Permisos ─────────────────────────────────
        $permisos = [
            // Proyectos
            'proyectos.ver', 'proyectos.crear', 'proyectos.editar', 'proyectos.eliminar',
            // Áreas
            'areas.ver', 'areas.crear', 'areas.editar', 'areas.eliminar',
            // Usuarios
            'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar',
            // Formularios
            'formularios.ver', 'formularios.crear', 'formularios.editar', 'formularios.eliminar',
            // Respuestas
            'respuestas.ver', 'respuestas.crear', 'respuestas.editar', 'respuestas.eliminar',
            // Aprobaciones
            'aprobaciones.ver', 'aprobaciones.firmar', 'aprobaciones.rechazar',
            // Reportes
            'reportes.ver', 'reportes.exportar',
            // Auditoría
            'auditoria.ver',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso, 'guard_name' => 'web']);
        }

        // ── 2. Roles ────────────────────────────────────
        $superadmin = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $superadmin->givePermissionTo(Permission::all());

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(Permission::all()); // Tiene todos los permisos pero será filtrado por proyecto


        $supervisor = Role::firstOrCreate(['name' => 'supervisor', 'guard_name' => 'web']);
        $supervisor->givePermissionTo([
            'proyectos.ver',
            'areas.ver',
            'usuarios.ver',
            'formularios.ver', 'formularios.crear', 'formularios.editar',
            'respuestas.ver', 'respuestas.crear', 'respuestas.editar',
            'aprobaciones.ver', 'aprobaciones.firmar', 'aprobaciones.rechazar',
            'reportes.ver', 'reportes.exportar',
        ]);

        $prevencionista = Role::firstOrCreate(['name' => 'prevencionista', 'guard_name' => 'web']);
        $prevencionista->givePermissionTo([
            'proyectos.ver',
            'areas.ver',
            'formularios.ver', 'formularios.crear', 'formularios.editar',
            'respuestas.ver', 'respuestas.crear', 'respuestas.editar',
            'aprobaciones.ver', 'aprobaciones.firmar',
            'reportes.ver',
        ]);

        // ── 3. Usuario Superadmin y Admin ───────────────
        $superadminUser = User::firstOrCreate(
            ['email' => 'superadmin@ssoma.com'],
            [
                'name' => 'Superadministrador SSOMA',
                'password' => 'password',
                'dni' => '00000000',
                'cargo' => 'Dueño del Sistema',
                'estado' => 'activo',
            ]
        );
        $superadminUser->assignRole('superadmin');

        $adminUser = User::firstOrCreate(
            ['email' => 'admin@ssoma.com'],
            [
                'name' => 'Administrador Residente',
                'password' => 'password',
                'dni' => '00000001',
                'cargo' => 'Residente de Proyecto',
                'estado' => 'activo',
            ]
        );
        $adminUser->assignRole('admin');

        // ── 4. Usuarios de ejemplo ──────────────────────
        $supervisorUser = User::firstOrCreate(
            ['email' => 'supervisor@ssoma.com'],
            [
                'name' => 'Carlos Mendoza',
                'password' => 'password',
                'dni' => '12345678',
                'cargo' => 'Supervisor de Seguridad',
                'estado' => 'activo',
            ]
        );
        $supervisorUser->assignRole('supervisor');

        $prevenUser = User::firstOrCreate(
            ['email' => 'prevencionista@ssoma.com'],
            [
                'name' => 'María García',
                'password' => 'password',
                'dni' => '87654321',
                'cargo' => 'Prevencionista de Riesgos',
                'estado' => 'activo',
            ]
        );
        $prevenUser->assignRole('prevencionista');

        // ── 5. Proyectos de ejemplo ──────────────────────
        $proyecto = Proyecto::firstOrCreate(
            ['codigo' => 'PROY-001'],
            [
                'nombre' => 'Construcción Edificio Central',
                'descripcion' => 'Proyecto de construcción del edificio administrativo central.',
                'ubicacion' => 'Lima, Perú',
                'estado' => 'activo',
                'fecha_inicio' => '2026-01-15',
                'fecha_fin' => '2026-12-31',
            ]
        );

        $proyectoCusco = Proyecto::firstOrCreate(
            ['codigo' => 'MP-CUSCO'],
            [
                'nombre' => 'MP CUSCO',
                'descripcion' => 'Proyecto de mejora y mantenimiento en la región Cusco.',
                'ubicacion' => 'Cusco, Perú',
                'estado' => 'activo',
                'fecha_inicio' => '2026-01-01',
                'fecha_fin' => '2026-12-31',
            ]
        );

        // Asignar usuarios a los proyectos
        $proyecto->usuarios()->syncWithoutDetaching([
            $superadminUser->id,
            $adminUser->id,
            $supervisorUser->id,
            $prevenUser->id,
        ]);

        $proyectoCusco->usuarios()->syncWithoutDetaching([
            $superadminUser->id,
            $adminUser->id,
            $supervisorUser->id,
            $prevenUser->id,
        ]);

        // ── 6. Áreas de ejemplo ─────────────────────────
        $areas = [
            ['codigo' => 'EST', 'nombre' => 'Estructuras', 'descripcion' => 'Área de trabajos estructurales'],
            ['codigo' => 'ELE', 'nombre' => 'Electricidad', 'descripcion' => 'Área de instalaciones eléctricas'],
            ['codigo' => 'SAN', 'nombre' => 'Sanitarias', 'descripcion' => 'Área de instalaciones sanitarias'],
            ['codigo' => 'ACB', 'nombre' => 'Acabados', 'descripcion' => 'Área de acabados y pintura'],
        ];

        foreach ($areas as $areaData) {
            $area = Area::firstOrCreate(
                ['proyecto_id' => $proyecto->id, 'codigo' => $areaData['codigo']],
                array_merge($areaData, ['proyecto_id' => $proyecto->id, 'estado' => 'activo'])
            );

            // Asignar usuarios a las áreas
            $area->usuarios()->syncWithoutDetaching([
                $supervisorUser->id,
                $prevenUser->id,
            ]);
        }

        $this->command->info('✅ Datos iniciales del ERP SSOMA creados exitosamente.');
        $this->command->info('   Superadmin: superadmin@ssoma.com / password');
        $this->command->info('   Admin (Residente): admin@ssoma.com / password');
        $this->command->info('   Supervisor: supervisor@ssoma.com / password');
        $this->command->info('   Prevencionista: prevencionista@ssoma.com / password');

        // ── 7. Formularios por Defecto ───────────────────
        $this->call([
            DemoFormsSeeder::class,
            SstFor034Seeder::class,
        ]);
        $this->command->info('✅ Formularios de prueba (ATS, Inspecciones, etc.) restaurados.');
    }
}
