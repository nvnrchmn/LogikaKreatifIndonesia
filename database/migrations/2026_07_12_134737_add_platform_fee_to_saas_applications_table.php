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
        Schema::table('saas_applications', function (Blueprint $table) {
            $table->string('platform_fee_type')->default('fixed')->after('webhook_url')->comment('fixed or percentage');
            $table->decimal('platform_fee_amount', 10, 2)->default(2500)->after('platform_fee_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saas_applications', function (Blueprint $table) {
            $table->dropColumn(['platform_fee_type', 'platform_fee_amount']);
        });
    }
};
