<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 100MB = 104857600 bytes
            $table->bigInteger('storage_used')->default(0)->after('role');
            $table->bigInteger('storage_limit')->default(104857600)->after('storage_used');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['storage_used', 'storage_limit']);
        });
    }
};
