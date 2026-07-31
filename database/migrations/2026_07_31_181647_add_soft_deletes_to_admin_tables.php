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
        $tables = [
            'services',
            'packages',
            'portfolios',
            'leads',
            'orders',
            'transactions',
            'saas_applications',
            'tickets'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $tableBlueprint) {
                    $tableBlueprint->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'services',
            'packages',
            'portfolios',
            'leads',
            'orders',
            'transactions',
            'saas_applications',
            'tickets'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $tableBlueprint) {
                    $tableBlueprint->dropSoftDeletes();
                });
            }
        }
    }
};
