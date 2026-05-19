<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('universities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            // Basic Info
            $table->string('name');
            $table->string('abbreviation')->nullable();
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('website')->nullable();

            // Location
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country');
            $table->string('country_code', 5)->nullable(); // US, GB, CA etc.

            // Category
            $table->enum('category', [
                'Public Research',
                'Private Research',
                'Liberal Arts',
                'Technical',
                'Community College',
                'Other',
            ])->default('Other');

            // Rankings & Stats
            $table->unsignedInteger('qs_ranking')->nullable();
            $table->decimal('acceptance_rate', 5, 2)->nullable(); // e.g. 7.00 = 7%
            $table->unsignedInteger('student_count')->nullable();
            $table->unsignedInteger('faculty_count')->nullable();
            $table->unsignedSmallInteger('founded_year')->nullable();

            // Details
            $table->string('president')->nullable();
            $table->string('motto')->nullable();
            $table->text('about')->nullable();
            $table->text('life_in_city')->nullable();

            // Status
            $table->boolean('is_published')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index('country_code');
            $table->index('category');
            $table->index('qs_ranking');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('universities');
    }
};
