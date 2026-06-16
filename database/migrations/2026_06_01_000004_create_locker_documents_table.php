<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locker_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('locker_id')->constrained()->cascadeOnDelete();

            // Which required document this checklist item refers to
            $table->nullableMorphs('required_document'); // polymorphic — program or scholarship required doc

            // For custom documents not from a template
            $table->string('custom_name')->nullable();
            $table->boolean('is_custom')->default(false);

            // Upload status
            $table->boolean('is_uploaded')->default(false);
            $table->boolean('is_validated')->default(false); // student ticked it

            // The actual uploaded file
            $table->string('file_url')->nullable();     // Supabase URL
            $table->string('file_name')->nullable();    // original filename
            $table->string('file_type')->nullable();    // mime type
            $table->unsignedBigInteger('file_size')->nullable(); // bytes

            $table->timestamps();

            $table->index('locker_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locker_documents');
    }
};
