<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel packages: paket harga tetap (mis. website UMKM) yang bisa
     * dibeli langsung oleh pengunjung publik tanpa login, untuk memenuhi
     * kebutuhan "produk/jasa + harga + checkout" pada verifikasi PG.
     */
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('strike_price')->nullable(); // harga coret, opsional
            $table->json('features')->nullable(); // list fitur/isi paket
            $table->boolean('is_featured')->default(false); // badge "Paling Laris"
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
