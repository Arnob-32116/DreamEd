<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->boolean('all_day')->default(false);
            $table->enum('urgency', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('color', 7)->default('#6366f1'); // hex color
            $table->enum('recurrence', ['none', 'daily', 'weekly', 'monthly', 'yearly'])->default('none');
            $table->date('recurrence_end')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->json('reminders')->nullable(); // [{"minutes": 10}, {"minutes": 60}]
            $table->json('attendees')->nullable(); // ["email@example.com"]
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'start_at', 'end_at']);
            $table->index(['user_id', 'urgency']);
        });

        Schema::create('event_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 7)->default('#6366f1');
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('user_id')
                ->constrained('event_categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
        Schema::dropIfExists('events');
        Schema::dropIfExists('event_categories');
    }
};
