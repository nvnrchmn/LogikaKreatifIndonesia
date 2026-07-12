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
        Schema::create('ph_disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saas_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ph_sub_account_id')->constrained('ph_sub_accounts')->cascadeOnDelete();
            $table->string('external_id')->unique();
            $table->string('xendit_disbursement_id')->nullable()->unique();
            $table->decimal('amount', 15, 2);
            $table->string('bank_code');
            $table->string('account_holder_name');
            $table->string('account_number');
            $table->string('status')->default('PENDING');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ph_disbursements');
    }
};
