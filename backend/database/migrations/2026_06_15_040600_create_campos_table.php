<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formulario_id')->constrained('formularios')->cascadeOnDelete();
            $table->string('etiqueta');
            $table->string('nombre_campo', 100);
            $table->enum('tipo', [
                'text', 'textarea', 'number', 'date', 'time', 'datetime',
                'select', 'multiselect', 'checkbox', 'radio',
                'foto', 'firma', 'archivo',
                'seccion', 'geolocalizacion'
            ]);
            $table->boolean('obligatorio')->default(false);
            $table->unsignedInteger('orden');
            $table->string('placeholder', 255)->nullable();
            $table->string('valor_defecto', 255)->nullable();
            $table->json('validaciones')->nullable()
                  ->comment('{"min":0,"max":100,"regex":"","min_length":3,"max_length":255,"accepted_extensions":["jpg","png"]}');
            $table->json('configuracion')->nullable()
                  ->comment('{"width":"half","help_text":"","conditional":{"field":"","value":""}}');
            $table->foreignId('seccion_padre_id')->nullable()->constrained('campos')->nullOnDelete();
            $table->timestamps();

            $table->index(['formulario_id', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campos');
    }
};
