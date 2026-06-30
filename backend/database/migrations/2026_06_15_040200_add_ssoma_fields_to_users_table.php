<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('dni', 20)->nullable()->unique()->after('email');
            $table->string('telefono', 20)->nullable()->after('dni');
            $table->string('cargo', 100)->nullable()->after('telefono');
            $table->string('avatar', 255)->nullable()->after('cargo');
            $table->string('firma_imagen', 500)->nullable()->after('avatar')
                  ->comment('URL a imagen de firma pre-cargada para supervisores/revisores');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo')->after('password');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['dni', 'telefono', 'cargo', 'avatar', 'firma_imagen', 'estado']);
            $table->dropSoftDeletes();
        });
    }
};
