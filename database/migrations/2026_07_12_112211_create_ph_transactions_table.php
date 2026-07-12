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
        Schema::create('ph_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saas_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ph_sub_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('external_id');
            $table->string('xendit_invoice_id')->nullable();
            $table->string('invoice_url')->nullable();
            $table->decimal('amount', 15, 2);
            $table->decimal('platform_fee_amount', 15, 2)->default(0);
            $table->string('status')->default('PENDING');
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->boolean('forwarded_to_webhook')->default(false);
            $table->timestamps();
            
            $table->unique(['saas_application_id', 'external_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ph_transactions');
    }
};
