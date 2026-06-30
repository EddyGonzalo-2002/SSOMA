<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('respuesta_id')->constrained('respuestas')->cascadeOnDelete();
            $table->string('url', 500);
            $table->string('nombre_archivo', 255);
            $table->enum('tipo', ['foto', 'documento', 'video']);
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('tamano_bytes')->nullable();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            $table->dateTime('fecha');
            $table->timestamps();

            $table->index(['respuesta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidencias');
    }
};
