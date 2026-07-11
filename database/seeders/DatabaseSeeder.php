<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\Portfolio;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic Indonesian data.
     */
    public function run(): void
    {
        // ============================
        // Roles
        // ============================
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'client']);

        // ============================
        // Admin User
        // ============================
        $admin = User::create([
            'name' => 'Admin Logikraf',
            'email' => 'admin@logikraf.id',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole('admin');

        // ============================
        // Services
        // ============================
        $services = [
            [
                'name' => 'Software Development',
                'slug' => 'software-development',
                'category' => 'software',
                'description' => 'Kami membangun aplikasi web dan mobile yang robust, scalable, dan aman menggunakan teknologi terkini. Dari sistem ERP perusahaan hingga platform e-commerce, tim developer kami siap mewujudkan solusi teknologi yang tepat untuk kebutuhan bisnis Anda.',
                'short_description' => 'Aplikasi web & mobile yang robust, scalable, dan aman menggunakan teknologi terkini seperti Laravel, React, dan Flutter.',
                'base_price' => 25000000,
                'sort_order' => 1,
            ],
            [
                'name' => 'UI/UX Design',
                'slug' => 'ui-ux-design',
                'category' => 'uiux',
                'description' => 'Desain antarmuka yang tidak hanya indah secara visual, tetapi juga intuitif dan mudah digunakan. Kami menerapkan metodologi design thinking dan user research untuk memastikan setiap piksel memiliki tujuan dan setiap interaksi terasa natural.',
                'short_description' => 'Desain antarmuka yang indah dan intuitif dengan metodologi design thinking dan user research yang mendalam.',
                'base_price' => 15000000,
                'sort_order' => 2,
            ],
            [
                'name' => 'Digital Marketing',
                'slug' => 'digital-marketing',
                'category' => 'marketing',
                'description' => 'Strategi pemasaran digital terintegrasi yang mencakup SEO, SEM, Social Media Marketing, dan Content Marketing. Kami membantu brand Anda menjangkau audiens yang tepat, meningkatkan visibilitas online, dan mengkonversi traffic menjadi pelanggan loyal.',
                'short_description' => 'Strategi pemasaran digital terintegrasi: SEO, SEM, Social Media, dan Content Marketing untuk pertumbuhan bisnis.',
                'base_price' => 8000000,
                'sort_order' => 3,
            ],
            [
                'name' => 'Branding & Identity',
                'slug' => 'branding-identity',
                'category' => 'branding',
                'description' => 'Membangun identitas brand yang kuat dan konsisten melalui desain logo, brand guideline, packaging, dan materi komunikasi visual. Kami membantu bisnis Anda tampil profesional dan memorable di benak konsumen.',
                'short_description' => 'Identitas brand yang kuat dan konsisten: logo, brand guideline, packaging, dan visual communication.',
                'base_price' => 12000000,
                'sort_order' => 4,
            ],
        ];

        $createdServices = [];
        foreach ($services as $service) {
            $createdServices[$service['category']] = Service::create($service);
        }

        // ============================
        // Portfolios (Realistic Indonesian Projects)
        // ============================
        $portfolios = [
            [
                'title' => 'Tokoku — Platform E-Commerce UMKM Jawa Tengah',
                'slug' => 'tokoku-ecommerce-umkm',
                'excerpt' => 'Platform marketplace yang menghubungkan pelaku UMKM Jawa Tengah dengan pembeli di seluruh Indonesia.',
                'description' => "Platform e-commerce yang dirancang khusus untuk memberdayakan pelaku UMKM di Jawa Tengah. Sistem ini mencakup manajemen produk, keranjang belanja, integrasi pembayaran Midtrans, sistem logistik otomatis, dan dashboard penjual yang komprehensif.\n\nFitur utama meliputi multi-vendor marketplace, real-time inventory tracking, automated order processing, dan analytics dashboard untuk memantau performa penjualan setiap merchant.",
                'client_name' => 'Dinas Koperasi & UMKM Jawa Tengah',
                'service_category' => 'software',
                'tech_stack' => ['Laravel', 'Livewire', 'MySQL', 'Midtrans', 'Tailwind CSS', 'Alpine.js'],
                'challenge' => 'Pelaku UMKM kesulitan menjangkau pasar digital karena keterbatasan teknis dan modal untuk membangun toko online sendiri.',
                'solution' => 'Membangun platform marketplace terintegrasi dengan onboarding yang sederhana, sehingga UMKM bisa langsung berjualan hanya dengan mengisi formulir dan mengunggah foto produk.',
                'result' => 'Dalam 6 bulan, platform berhasil merekrut 500+ UMKM aktif dengan total transaksi lebih dari Rp 2 Miliar per bulan.',
                'project_url' => '#',
                'completed_at' => '2025-08-15',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'SatuSehat Clinic — Sistem Manajemen Klinik',
                'slug' => 'satusehat-clinic-management',
                'excerpt' => 'Sistem informasi manajemen klinik terintegrasi dengan BPJS dan rekam medis elektronik.',
                'description' => "Aplikasi web manajemen klinik yang mengintegrasikan pendaftaran pasien, rekam medis elektronik, penjadwalan dokter, farmasi, dan billing dalam satu platform terpadu.\n\nSistem ini juga terintegrasi dengan bridging BPJS Kesehatan untuk memudahkan klaim asuransi dan pelaporan.",
                'client_name' => 'Klinik Pratama Sehat Abadi',
                'service_category' => 'software',
                'tech_stack' => ['Laravel', 'React', 'PostgreSQL', 'REST API', 'Docker'],
                'challenge' => 'Klinik masih menggunakan pencatatan manual yang rawan kesalahan dan memperlambat pelayanan pasien.',
                'solution' => 'Membangun sistem digital terintegrasi yang mengotomasi alur kerja klinik dari pendaftaran hingga pembayaran, termasuk integrasi BPJS.',
                'result' => 'Waktu pelayanan pasien berkurang 60%, dengan zero downtime sejak peluncuran. Kepuasan pasien meningkat dari 72% menjadi 94%.',
                'completed_at' => '2025-05-20',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Redesign Mobile App — Bank Nusantara Digital',
                'slug' => 'bank-nusantara-mobile-redesign',
                'excerpt' => 'Redesign komprehensif mobile banking app dengan fokus pada user experience dan aksesibilitas.',
                'description' => "Proyek redesign menyeluruh untuk aplikasi mobile banking Bank Nusantara Digital. Proses dimulai dari user research mendalam, usability testing, hingga pembuatan design system yang konsisten dan scalable.\n\nHasil akhir berupa prototype high-fidelity di Figma lengkap dengan komponen library dan interaction guidelines.",
                'client_name' => 'PT. Bank Nusantara Digital',
                'service_category' => 'uiux',
                'tech_stack' => ['Figma', 'Design System', 'Prototyping', 'User Research'],
                'challenge' => 'Aplikasi mobile banking yang ada memiliki tingkat abandon rate 45% dan banyak keluhan dari nasabah tentang navigasi yang membingungkan.',
                'solution' => 'Melakukan redesign berbasis data user research dan usability testing dengan 200+ responden, menghasilkan design system yang intuitif dan aksesibel.',
                'result' => 'Setelah implementasi, abandon rate turun menjadi 12% dan NPS (Net Promoter Score) meningkat dari 32 menjadi 71.',
                'completed_at' => '2025-11-10',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Growth Campaign — Warung Digital Indonesia',
                'slug' => 'warung-digital-growth-campaign',
                'excerpt' => 'Kampanye digital marketing terintegrasi untuk meningkatkan brand awareness dan akuisisi pengguna.',
                'description' => "Kampanye digital marketing komprehensif untuk startup F&B tech Warung Digital Indonesia. Strategi mencakup SEO on-page & off-page, Google Ads, Meta Ads, content marketing, dan influencer collaboration.\n\nKampanye berjalan selama 6 bulan dengan target meningkatkan brand awareness dan menambah 10.000 pengguna baru.",
                'client_name' => 'PT. Warung Digital Indonesia',
                'service_category' => 'marketing',
                'tech_stack' => ['Google Ads', 'Meta Ads', 'SEO', 'Content Marketing', 'Analytics'],
                'challenge' => 'Sebagai startup baru, Warung Digital belum memiliki brand awareness dan harus bersaing dengan pemain besar di industri F&B tech.',
                'solution' => 'Merancang kampanye multi-channel yang menggabungkan paid advertising, organic content, dan kolaborasi dengan food influencer lokal.',
                'result' => 'Berhasil meraih 15.000+ pengguna baru (150% dari target), dengan Cost Per Acquisition (CPA) 40% lebih rendah dari benchmark industri.',
                'completed_at' => '2025-09-30',
                'sort_order' => 4,
            ],
            [
                'title' => 'Brand Identity — Kopi Nusantara Raya',
                'slug' => 'kopi-nusantara-raya-branding',
                'excerpt' => 'Pembangunan identitas brand premium untuk jaringan kedai kopi specialty asal Yogyakarta.',
                'description' => "Proyek branding menyeluruh untuk Kopi Nusantara Raya, sebuah kedai kopi specialty yang ingin ekspansi dari Yogyakarta ke kota-kota besar di Indonesia.\n\nDeliverables mencakup logo design, brand guideline, packaging design, menu design, store interior guideline, dan seluruh materi komunikasi visual.",
                'client_name' => 'CV. Kopi Nusantara Raya',
                'service_category' => 'branding',
                'tech_stack' => ['Adobe Illustrator', 'Photoshop', 'Brand Strategy', 'Packaging'],
                'challenge' => 'Brand lama terkesan terlalu tradisional dan tidak menarik bagi segmen anak muda urban yang menjadi target pasar utama.',
                'solution' => 'Membangun brand identity baru yang menggabungkan elemen heritage Nusantara dengan estetika modern, menciptakan kesan premium namun tetap approachable.',
                'result' => 'Setelah rebranding, penjualan meningkat 85% dan brand berhasil membuka 3 cabang baru di Jakarta dan Surabaya dalam 4 bulan.',
                'completed_at' => '2025-07-22',
                'sort_order' => 5,
            ],
            [
                'title' => 'Dashboard Analytics — Logistics Pro',
                'slug' => 'logistics-pro-dashboard',
                'excerpt' => 'Dashboard real-time untuk monitoring armada logistik dan optimasi rute pengiriman.',
                'description' => "Sistem dashboard analytics real-time untuk perusahaan logistik yang mengelola 200+ armada pengiriman di Pulau Jawa dan Sumatera.\n\nDashboard mencakup live tracking armada, heat map area pengiriman, prediksi waktu kedatangan (ETA), dan laporan performa driver.",
                'client_name' => 'PT. Logistics Pro Indonesia',
                'service_category' => 'software',
                'tech_stack' => ['Laravel', 'Vue.js', 'WebSocket', 'Google Maps API', 'Redis'],
                'challenge' => 'Perusahaan kesulitan memantau lokasi armada secara real-time dan mengoptimasi rute pengiriman yang efisien.',
                'solution' => 'Membangun dashboard berbasis WebSocket untuk live tracking dan algoritma optimasi rute menggunakan Google Maps Directions API.',
                'result' => 'Efisiensi bahan bakar meningkat 25% dan rata-rata waktu pengiriman berkurang dari 3 hari menjadi 1.5 hari.',
                'completed_at' => '2025-12-05',
                'sort_order' => 6,
            ],
        ];

        foreach ($portfolios as $data) {
            $category = $data['service_category'];
            unset($data['service_category']);
            $data['service_id'] = $createdServices[$category]->id;
            Portfolio::create($data);
        }

        // ============================
        // Sample Leads
        // ============================
        $leads = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@perusahaan.co.id',
                'phone' => '081234567890',
                'company' => 'PT. Maju Bersama Sejahtera',
                'service_category' => 'software',
                'project_description' => 'Kami membutuhkan sistem ERP terintegrasi untuk mengelola inventory, accounting, dan HR di 5 cabang kami yang tersebar di Jawa dan Bali.',
                'estimated_pages' => '15-20 modul',
                'target_launch' => 'Q1 2026',
                'budget_range' => 'above_100m',
            ],
            [
                'name' => 'Sari Dewi',
                'email' => 'sari.dewi@startup.id',
                'phone' => '087654321098',
                'company' => 'FreshMart',
                'service_category' => 'uiux',
                'project_description' => 'Redesign UI/UX untuk aplikasi grocery delivery kami. Kami ingin meningkatkan conversion rate dan menurunkan bounce rate.',
                'estimated_pages' => '30+ screen',
                'target_launch' => '2 bulan',
                'budget_range' => '25m_50m',
            ],
            [
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi@gmail.com',
                'phone' => '089876543210',
                'company' => null,
                'service_category' => 'marketing',
                'project_description' => 'Saya memiliki bisnis catering rumahan yang ingin go digital. Butuh bantuan untuk social media marketing dan Google Ads.',
                'estimated_pages' => '1 landing page',
                'target_launch' => 'Secepatnya',
                'budget_range' => 'under_10m',
            ],
        ];

        foreach ($leads as $lead) {
            Lead::create($lead);
        }
    }
}
