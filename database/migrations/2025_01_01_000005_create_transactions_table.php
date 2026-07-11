<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel transactions: Log pembayaran agnostic per milestone/termin.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('transaction_reference')->unique();
            $table->string('milestone_name')->nullable(); // e.g. dp_kickoff, development, uat_launch
            $table->string('payment_method')->nullable();
            $table->unsignedBigInteger('amount');
            $table->enum('status', ['pending', 'settlement', 'expired', 'failed'])->default('pending');
            $table->string('payment_url')->nullable();
            $table->json('raw_gateway_response')->nullable();
            $table->timestamp('settled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
