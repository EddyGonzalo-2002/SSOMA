<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aprobaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('respuesta_id')->constrained('respuestas')->cascadeOnDelete();
            $table->foreignId('rol_firma_id')->constrained('roles_firma')->cascadeOnDelete();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('estado', ['pendiente', 'firmado', 'rechazado'])->default('pendiente');
            $table->text('firma')->nullable()
                  ->comment('Pre-loaded signature image URL from user profile (users.firma_imagen)');
            $table->text('comentario')->nullable();
            $table->dateTime('fecha')->nullable();
            $table->timestamps();

            $table->index(['respuesta_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aprobaciones');
    }
};
