<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('respuestas', function (Blueprint $table) {
            $table->foreignId('actividad_id')->nullable()->after('proyecto_id')
                  ->constrained('actividades')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('respuestas', function (Blueprint $table) {
            $table->dropForeign(['actividad_id']);
            $table->dropColumn('actividad_id');
        });
    }
};
