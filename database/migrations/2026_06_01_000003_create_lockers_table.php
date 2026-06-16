<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lockers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->default('document'); // document, academic, personal, financial, study
            $table->enum('type', ['university', 'scholarship'])->default('university');

            // Linked to either a program or a scholarship
            $table->foreignId('university_program_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('scholarship_id')->nullable()->constrained()->nullOnDelete();

            $table->boolean('is_starred')->default(false);
            $table->bigInteger('storage_used')->default(0); // bytes

            $table->timestamps();

            $table->index(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lockers');
    }
};
