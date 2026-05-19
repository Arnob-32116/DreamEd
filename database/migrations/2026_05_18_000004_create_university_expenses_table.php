<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('university_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained()->cascadeOnDelete();

            // Main costs
            $table->decimal('annual_tuition', 10, 2)->nullable();
            $table->decimal('room_and_board', 10, 2)->nullable();
            $table->decimal('application_fee', 8, 2)->nullable();

            // Additional expenses
            $table->decimal('books_supplies', 8, 2)->nullable();
            $table->decimal('transportation', 8, 2)->nullable();
            $table->decimal('personal_expenses', 8, 2)->nullable();
            $table->decimal('health_insurance', 8, 2)->nullable();

            // Financial aid note
            $table->text('financial_aid_note')->nullable();
            $table->string('financial_aid_url')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('university_expenses');
    }
};
