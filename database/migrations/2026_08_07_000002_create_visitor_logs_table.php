<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitor_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ip', 45)->nullable()->index();
            $table->string('method', 10)->nullable();
            $table->string('path', 2048)->nullable()->index();
            $table->string('route_name', 100)->nullable()->index();
            $table->string('user_agent', 512)->nullable();
            $table->string('referer', 512)->nullable();
            $table->boolean('is_bot')->default(false);
            $table->nullableMorphs('user');
            $table->timestamp('visited_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_logs');
    }
};
