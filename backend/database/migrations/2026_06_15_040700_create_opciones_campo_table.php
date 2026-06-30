<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opciones_campo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campo_id')->constrained('campos')->cascadeOnDelete();
            $table->string('valor');
            $table->string('etiqueta');
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opciones_campo');
    }
};
