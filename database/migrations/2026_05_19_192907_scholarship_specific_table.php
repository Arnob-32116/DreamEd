<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            // ── Identity ───────────────────────────────────────────────────
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('institution');           // e.g. "DAAD Institution", "Fulbright"
            $table->string('logo')->nullable();      // Supabase URL
            $table->string('cover_image')->nullable(); // Supabase URL
            $table->string('website')->nullable();

            // ── Location ───────────────────────────────────────────────────
            $table->string('country')->nullable();
            $table->string('country_code', 5)->nullable();  // DE, US, GB …

            // ── Classification ─────────────────────────────────────────────
            $table->enum('type', [
                'Merit-Based',
                'Need-Based',
                'Athletic',
                'Research',
                'Government',
                'Other',
            ])->default('Merit-Based');

            $table->enum('coverage_type', [
                'Fully Funded',
                'Partial',
                'Tuition Only',
                'Living Expenses',
                'Full Ride',
            ])->default('Partial');

            // ── Financial breakdown ────────────────────────────────────────
            $table->string('currency', 5)->default('USD');  // USD, EUR, GBP …
            $table->decimal('monthly_amount', 12, 2)->nullable();
            $table->decimal('tuition_coverage', 12, 2)->nullable();  // 0 = fully covered
            $table->decimal('travel_allowance', 12, 2)->nullable();
            $table->decimal('living_allowance', 12, 2)->nullable();   // per month

            // ── Details ────────────────────────────────────────────────────
            $table->string('duration')->nullable();          // e.g. "12-24 months"
            $table->unsignedInteger('recipients')->nullable();
            $table->text('description')->nullable();

            // Programs / subjects offered — stored as JSON array
            // e.g. [{"name":"Engineering","count":15},{"name":"Natural Sciences","count":25}]
            $table->json('subject_areas')->nullable();

            // ── Status ─────────────────────────────────────────────────────
            $table->boolean('is_published')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index('country_code');
            $table->index('type');
            $table->index('coverage_type');
            $table->index('institution');
            $table->index(['is_published', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};