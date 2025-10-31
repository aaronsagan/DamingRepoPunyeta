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
        Schema::table('donations', function (Blueprint $table) {
            $table->string('receipt_image_path')->nullable()->after('proof_path');
            $table->longText('ocr_text')->nullable()->after('receipt_image_path');
            $table->string('ocr_ref_number')->nullable()->after('ocr_text');
            $table->string('ocr_amount')->nullable()->after('ocr_ref_number');
            $table->string('ocr_date')->nullable()->after('ocr_amount');
            $table->integer('ocr_confidence')->nullable()->after('ocr_date'); // 0-100
            $table->enum('verification_status', ['pending','auto_verified','manual_verified','rejected'])->default('pending')->after('ocr_confidence');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn([
                'receipt_image_path',
                'ocr_text',
                'ocr_ref_number',
                'ocr_amount',
                'ocr_date',
                'ocr_confidence',
                'verification_status'
            ]);
        });
    }
};
