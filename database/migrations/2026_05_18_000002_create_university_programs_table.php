<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('university_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('school')->nullable(); // e.g. School of Engineering
            $table->enum('degree_type', ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate']);
            $table->string('duration')->nullable();        // e.g. "4 years"
            $table->decimal('tuition_fee', 10, 2)->nullable();
            $table->date('application_deadline')->nullable();
            $table->string('program_url')->nullable();
            $table->text('required_qualifications')->nullable();
            $table->json('subjects')->nullable(); // ["Computer Science", "Engineering"]

            $table->timestamps();

            $table->index(['university_id', 'degree_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('university_programs');
    }
};
