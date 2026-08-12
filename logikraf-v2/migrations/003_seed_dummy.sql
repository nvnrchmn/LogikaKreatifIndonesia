-- Dummy data untuk Go+React frontend (sesuai schema aktual)
INSERT IGNORE INTO portfolios (title, slug, client_name, excerpt, description, thumbnail, is_published, is_featured, created_at, updated_at) VALUES
('Sistem POS Retail', 'sistem-pos-retail', 'Toko Maju Jaya', 'Aplikasi POS untuk 50+ outlet.', 'Full-stack POS dengan realtime inventory.', 'https://placehold.co/800x400/0052FF/FFFFFF?text=POS+Retail', 1, 1, NOW(), NOW()),
('Website Kampus Digital', 'website-kampus-digital', 'Universitas Nusantara', 'Portal akademik terpadu.', 'Single-page application dengan SSO.', 'https://placehold.co/800x400/FF3B30/FFFFFF?text=Kampus+Digital', 1, 0, NOW(), NOW()),
('Branding Startup', 'branding-startup', 'PT Inovasi Teknologi', 'Identitas merek lengkap.', 'Logo, typography, color palette, guidelines.', 'https://placehold.co/800x400/34C759/FFFFFF?text=Branding+Startup', 1, 1, NOW(), NOW()),
('Dashboard IoT', 'dashboard-iot', 'PT Smart Factory', 'Monitoring sensor real-time.', 'Grafik live + alert otomatis.', 'https://placehold.co/800x400/FF9500/FFFFFF?text=IoT+Dashboard', 0, 0, NOW(), NOW());

INSERT IGNORE INTO posts (title, slug, excerpt, body, is_published, published_at, created_at, updated_at) VALUES
('Cara Memilih Vendor IT yang Tepat', 'cara-memilih-vendor-it', 'Panduan singkat untuk memilih vendor IT yang sesuai budget dan kebutuhan.', '<p>Evaluasi portfolio, testimoni, dan SLA sebelum memilih vendor.</p>', 1, NOW(), NOW(), NOW()),
('Mengapa Website Company Profile Masih Diperlukan di 2026', 'mengapa-website-company-profile', 'Branding digital bukan cuma Instagram.', '<p>SEO, trust, dan kontrol konten penuh.</p>', 1, NOW(), NOW(), NOW()),
('Rekomendasi Stack Teknologi untuk Startup', 'rekomendasi-stack-teknologi', 'Pilihan tech stack yang scalable dan hemat biaya.', '<p>Go + React + Vite vs Node + Next.</p>', 1, NOW(), NOW(), NOW()),
('Checklist Before Release Aplikasi', 'checklist-before-release', 'Pastikan QA, security, dan monitoring sebelum live.', '<p>Unit test, load test, backup DB, rollback plan.</p>', 0, NOW(), NOW(), NOW());

INSERT IGNORE INTO testimonials (name, role, content, avatar, is_approved, is_featured, sort_order, created_at, updated_at) VALUES
('Budi Santoso', 'CEO Toko Maju Jaya', 'Tim Logikraf sangat responsif dan hasilnya memuaskan.', 'https://placehold.co/100x100/0052FF/FFFFFF?text=BS', 1, 1, 1, NOW(), NOW()),
('Sari Dewi', 'Rektor Universitas Nusantara', 'Website portal akademik berjalan lancar.', 'https://placehold.co/100x100/FF3B30/FFFFFF?text=SD', 1, 1, 2, NOW(), NOW()),
('Rian Hidayat', 'CTO PT Inovasi Teknologi', 'Branding yang dihasilkan kuat dan konsisten.', 'https://placehold.co/100x100/34C759/FFFFFF?text=RH', 1, 0, 3, NOW(), NOW()),
('Dina Lestari', 'Plant Manager PT Smart Factory', 'Dashboard IoT real-time sesuai ekspektasi.', 'https://placehold.co/100x100/FF9500/FFFFFF?text=DL', 1, 0, 4, NOW(), NOW());

INSERT IGNORE INTO clients (company_name, pic_name, email, phone, address, city, notes, created_at, updated_at) VALUES
('Toko Maju Jaya', 'Budi Santoso', 'budi@majujaya.id', '081234567890', 'Jl. Sudirman No. 1', 'Jakarta', 'Klien lama sejak 2023', NOW(), NOW()),
('Universitas Nusantara', 'Sari Dewi', 'sari@universitasnusantara.ac.id', '0215551234', 'Jl. Pasteur No. 5', 'Bandung', 'Kontak utama: Pak Hadi', NOW(), NOW()),
('PT Inovasi Teknologi', 'Rian Hidayat', 'rian@inovasi.tech', '089912345678', 'Jl. Raya Darmo No. 10', 'Surabaya', 'Branding + Website', NOW(), NOW()),
('PT Smart Factory', 'Dina Lestari', 'dina@smartfactory.id', '0317654321', 'Jl. Pemuda No. 22', 'Semarang', 'Project IoT dashboard', NOW(), NOW());

INSERT IGNORE INTO invoices (invoice_number, type, total, status, issue_date, due_date, created_at, updated_at) VALUES
('INV/2026/001', 'invoice', 15000000, 'paid', '2026-08-01', '2026-08-15', NOW(), NOW()),
('INV/2026/002', 'invoice', 5000000, 'sent', '2026-08-05', '2026-08-20', NOW(), NOW()),
('INV/2026/003', 'estimate', 2500000, 'draft', '2026-08-10', '2026-08-25', NOW(), NOW()),
('INV/2026/004', 'invoice', 35000000, 'cancelled', '2026-07-01', '2026-07-30', NOW(), NOW());
