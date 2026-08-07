<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number', 50)->unique();
            $table->enum('type', ['quotation', 'invoice'])->default('quotation');
            $table->enum('status', ['draft', 'sent', 'approved', 'rejected', 'paid', 'cancelled'])
                ->default('draft');
            $table->foreignId('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('client_name');
            $table->string('client_email')->nullable();
            $table->string('client_company')->nullable();
            $table->text('subject');
            $table->text('notes')->nullable();
            $table->json('items'); // [{description, qty, unit_price}]
            $table->integer('subtotal');
            $table->integer('tax_amount')->default(0);
            $table->integer('total');
            $table->integer('discount_amount')->default(0);
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
