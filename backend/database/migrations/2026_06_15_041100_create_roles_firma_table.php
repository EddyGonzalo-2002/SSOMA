<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles_firma', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formulario_id')->constrained('formularios')->cascadeOnDelete();
            $table->string('rol', 100);
            $table->string('nombre_display', 255);
            $table->unsignedInteger('orden');
            $table->boolean('obligatorio')->default(true);
            $table->timestamps();

            $table->unique(['formulario_id', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles_firma');
    }
};
