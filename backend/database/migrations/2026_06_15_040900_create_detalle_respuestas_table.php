<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_respuestas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('respuesta_id')->constrained('respuestas')->cascadeOnDelete();
            $table->foreignId('campo_id')->constrained('campos')->cascadeOnDelete();
            $table->text('valor')->nullable();
            $table->string('valor_archivo', 500)->nullable()
                  ->comment('URL to file in S3 for foto/firma/archivo field types');
            $table->timestamps();

            $table->unique(['respuesta_id', 'campo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_respuestas');
    }
};
