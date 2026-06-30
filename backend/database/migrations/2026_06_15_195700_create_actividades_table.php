<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete();
            $table->string('nombre'); // Ej: "Instalación de Gabinetes", "Desmontaje y Montaje de Cámaras"
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['activa', 'completada', 'cancelada'])->default('activa');
            $table->date('fecha_programada')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividades');
    }
};
