<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('respuesta_id')->constrained('respuestas')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('dni', 20);
            $table->string('cargo', 100)->nullable();
            $table->string('empresa', 255)->nullable();
            $table->text('firma')->nullable()
                  ->comment('Base64 encoded PNG image of handwritten signature captured via touch canvas');
            $table->dateTime('fecha');
            $table->timestamps();

            $table->index(['respuesta_id']);
            $table->index(['dni']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participantes');
    }
};
