<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_required_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_program_id')->constrained()->cascadeOnDelete();
            $table->string('name');                    // e.g. "Personal Statement"
            $table->text('description')->nullable();   // e.g. "Max 2 pages, describe your goals"
            $table->boolean('is_mandatory')->default(true);
            $table->string('accepted_formats')->nullable(); // e.g. "PDF, DOCX"
            $table->unsignedInteger('max_size_mb')->default(10);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('university_program_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_required_documents');
    }
};
