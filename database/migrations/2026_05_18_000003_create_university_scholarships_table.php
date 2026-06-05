<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('university_scholarships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->enum('type', ['Merit-Based', 'Need-Based', 'Athletic', 'Research', 'Government', 'Other'])
                  ->default('Merit-Based');
            $table->enum('coverage', ['Full Tuition', 'Partial', 'Living Expenses', 'Full Ride'])
                  ->default('Partial');
            $table->boolean('is_independent')->default(false); // university-offered vs independent

            $table->text('description')->nullable();
            $table->decimal('total_amount', 12, 2)->nullable();
            $table->unsignedInteger('recipients')->nullable();
            $table->unsignedInteger('eligible_countries')->nullable(); // number of countries
            $table->string('programs_covered')->nullable(); // e.g. "Master's, PhD"
            $table->string('scholarship_url')->nullable();

            $table->timestamps();

            $table->index('university_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('university_scholarships');
    }
};
