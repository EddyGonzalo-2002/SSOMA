<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proyectos', function (Blueprint $table) {
            $table->string('ruc', 11)->default('20545318561')->after('ubicacion');
            $table->string('razon_social')->default('TACTICAL IT')->after('ruc');
            $table->string('actividad_economica')->default('Actividades de arquitectura e ingeniería y comunicaciones')->after('razon_social');
        });
    }

    public function down(): void
    {
        Schema::table('proyectos', function (Blueprint $table) {
            $table->dropColumn(['ruc', 'razon_social', 'actividad_economica']);
        });
    }
};
