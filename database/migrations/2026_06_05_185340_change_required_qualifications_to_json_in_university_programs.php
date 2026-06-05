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
    Schema::table('university_programs', function (Blueprint $table) {
        $table->json('required_qualifications')->nullable()->change();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    Schema::table('university_programs', function (Blueprint $table) {
        $table->text('required_qualifications')->nullable()->change();
    });
    }
};
