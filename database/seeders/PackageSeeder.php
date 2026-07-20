<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    /**
     * 3 paket website UMKM harga tetap. Sesuaikan nama, isi, dan harga
     * sesuai penawaran Logikraf yang sebenarnya sebelum go-live.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'tagline' => 'Landing page 1 halaman untuk usaha yang baru mulai online',
                'price' => 1500000,
                'features' => [
                    '1 halaman (profil usaha, produk/jasa, kontak)',
                    'Desain responsif (mobile & desktop)',
                    'Tombol WhatsApp langsung',
                    '2x revisi desain',
                    'Selesai dalam 5 hari kerja',
                ],
                'is_featured' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Bisnis',
                'slug' => 'bisnis',
                'tagline' => 'Company profile lengkap untuk usaha yang mau tampil lebih profesional',
                'price' => 3500000,
                'strike_price' => 4500000,
                'features' => [
                    'Hingga 5 halaman (beranda, tentang, layanan/produk, galeri, kontak)',
                    'Desain custom sesuai brand',
                    'Katalog produk/jasa dengan foto',
                    'Optimasi SEO dasar',
                    '3x revisi desain',
                    'Selesai dalam 10 hari kerja',
                ],
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'tagline' => 'Website + panel admin sederhana untuk kelola konten sendiri',
                'price' => 7500000,
                'features' => [
                    'Semua fitur paket Bisnis',
                    'Panel admin untuk update konten & produk mandiri',
                    'Form pemesanan/booking online',
                    'Integrasi WhatsApp & Google Maps',
                    'Pendampingan setup domain & hosting',
                    'Selesai dalam 20 hari kerja',
                ],
                'is_featured' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($packages as $package) {
            Package::updateOrCreate(['slug' => $package['slug']], $package);
        }
    }
}
