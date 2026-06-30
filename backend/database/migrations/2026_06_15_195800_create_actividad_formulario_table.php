<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividad_formulario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')->constrained('actividades')->cascadeOnDelete();
            $table->foreignId('formulario_id')->constrained('formularios')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['actividad_id', 'formulario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividad_formulario');
    }
};
