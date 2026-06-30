<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('formularios', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['proyecto_id']);
        });

        Schema::table('formularios', function (Blueprint $table) {
            // Make the column nullable
            $table->unsignedBigInteger('proyecto_id')->nullable()->change();
            
            // Re-add foreign key with set null on delete (optional, but good practice since it's nullable now)
            $table->foreign('proyecto_id')->references('id')->on('proyectos')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formularios', function (Blueprint $table) {
            $table->dropForeign(['proyecto_id']);
        });

        Schema::table('formularios', function (Blueprint $table) {
            $table->unsignedBigInteger('proyecto_id')->nullable(false)->change();
            $table->foreign('proyecto_id')->references('id')->on('proyectos')->cascadeOnDelete();
        });
    }
};
