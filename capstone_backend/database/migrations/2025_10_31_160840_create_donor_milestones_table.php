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
        Schema::create('donor_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donor_id')->constrained('users')->onDelete('cascade');
            $table->string('key'); // Machine-readable key like 'first_donation', 'total_1000'
            $table->string('title'); // Display title like "First Donation"
            $table->text('description'); // Description of the milestone
            $table->string('icon')->nullable(); // Icon name or class
            $table->timestamp('achieved_at')->nullable(); // When milestone was achieved
            $table->json('meta')->nullable(); // Extra data like progress, thresholds
            $table->timestamps();
            
            // Indexes for performance
            $table->index('donor_id');
            $table->index('key');
            $table->unique(['donor_id', 'key']); // Unique combination of donor and milestone key
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donor_milestones');
    }
};
