<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel leads: Formulir estimasi proyek dari calon klien.
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->enum('service_category', ['software', 'uiux', 'marketing', 'branding']);
            $table->text('project_description');
            $table->string('estimated_pages')->nullable();
            $table->string('target_launch')->nullable();
            $table->enum('budget_range', [
                'under_10m',
                '10m_25m',
                '25m_50m',
                '50m_100m',
                'above_100m',
            ]);
            $table->unsignedInteger('lead_score')->default(0);
            $table->enum('status', ['new', 'contacted', 'qualified', 'converted', 'lost'])->default('new');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
