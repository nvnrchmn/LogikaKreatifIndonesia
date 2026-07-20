<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah dukungan checkout paket publik. user_id & service_id TETAP
     * wajib diisi (tidak diubah nullable, supaya tidak butuh doctrine/dbal
     * dan tidak mengubah relasi lama) — untuk order dari checkout paket,
     * kita auto-provision User (akun klien ringan) dan pakai Service
     * "Paket Website UMKM" sebagai service_id-nya. Kolom guest_* di sini
     * hanya untuk menyimpan data kontak asli yang diisi di form checkout.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('package_id')->nullable()->after('service_id')->constrained()->nullOnDelete();
            $table->string('guest_name')->nullable()->after('package_id');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone')->nullable()->after('guest_email');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropColumn(['package_id', 'guest_name', 'guest_email', 'guest_phone']);
        });
    }
};
