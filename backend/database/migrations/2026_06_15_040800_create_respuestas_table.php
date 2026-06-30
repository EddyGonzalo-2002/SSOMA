<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('respuestas', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('formulario_id')->constrained('formularios')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete();
            $table->foreignId('area_id')->nullable()->constrained('areas')->nullOnDelete();
            $table->enum('estado_general', [
                'borrador', 'pendiente', 'en_proceso', 'aprobado', 'rechazado'
            ])->default('borrador');
            $table->dateTime('fecha');
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            $table->text('notas')->nullable();
            $table->timestamp('synced_at')->nullable()
                  ->comment('Timestamp of last sync from mobile device');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['proyecto_id', 'formulario_id']);
            $table->index(['estado_general']);
            $table->index(['fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('respuestas');
    }
};
