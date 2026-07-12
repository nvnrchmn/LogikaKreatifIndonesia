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
        Schema::create('ph_sub_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saas_application_id')->constrained()->cascadeOnDelete();
            $table->string('external_reference_id');
            $table->string('xendit_account_id')->unique();
            $table->string('business_name');
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ph_sub_accounts');
    }
};
