<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formularios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('codigo', 100);
            $table->text('descripcion')->nullable();
            $table->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete();
            $table->foreignId('area_id')->nullable()->constrained('areas')->nullOnDelete();
            $table->unsignedInteger('version')->default(1);
            $table->boolean('requiere_participantes')->default(false);
            $table->boolean('requiere_geolocalizacion')->default(false);
            $table->enum('estado', ['borrador', 'publicado', 'archivado'])->default('borrador');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['proyecto_id', 'codigo', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formularios');
    }
};
