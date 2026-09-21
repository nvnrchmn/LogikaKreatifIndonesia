import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

const appTypes = [
  { icon: '🧾', title: 'Aplikasi Kasir & POS', desc: 'Transaksi penjualan, katalog produk, varian, promo/voucher, hingga laporan penjualan harian.' },
  { icon: '🛒', title: 'Toko Online & Sistem Order', desc: 'Keranjang, checkout, manajemen pesanan, dan invoice digital untuk penjualan online.' },
  { icon: '📦', title: 'Manajemen Inventory & Stok', desc: 'Pencatatan stok, mutasi barang, dan pemantauan ketersediaan produk.' },
  { icon: '📊', title: 'Sistem Informasi Internal', desc: 'Dashboard admin, manajemen pengguna & peran, database pelanggan, sampai analitik.' },
  { icon: '💳', title: 'Integrasi Pembayaran QRIS', desc: 'Gerbang pembayaran resmi berlisensi PJP Bank Indonesia dengan verifikasi otomatis via webhook.' },
  { icon: '🚚', title: 'Integrasi Pengiriman', desc: 'Penyambungan layanan kirim dan pelacakan pesanan langsung dari sistem Anda.' },
]

const steps = [
  { n: '01', t: 'Konsultasi kebutuhan', d: 'Kami petakan proses bisnis Anda dan tentukan fitur yang benar-benar dipakai.' },
  { n: '02', t: 'Cakupan kerja & timeline', d: 'Anda menerima rincian fitur, harga tetap, dan jadwal yang dapat dipertanggungjawabkan.' },
  { n: '03', t: 'Pengerjaan bertahap per sprint', d: 'Progres dikirim berkala dengan CI/CD di setiap pengiriman, bukan sekali jadi di akhir.' },
  { n: '04', t: 'Rilis & pendampingan', d: 'Setelah rilis, bug teknis diperbaiki gratis selama masa garansi aktif.' },
]
const faqs = [
  { q: 'Apa bedanya aplikasi web custom dengan software jadi?', a: 'Aplikasi custom dibangun mengikuti alur kerja Anda, sehingga fitur yang ada benar-benar dipakai. Software jadi menuntut Anda menyesuaikan cara kerja dengan template-nya.' },
  { q: 'Apakah kode sumber dan dokumentasinya menjadi milik saya?', a: 'Ya. Anda menerima akses penuh atas kode dan dokumentasi proyek yang kami bangun.' },
  { q: 'Apakah aplikasi bisa dibuka dari ponsel?', a: 'Bisa. Aplikasi dibangun sebagai web app yang diakses lewat browser di desktop maupun ponsel, tanpa perlu instalasi tambahan.' },
  { q: 'Berapa biaya dan bagaimana cara pembayarannya?', a: 'Biaya paket mulai Rp 1.499.000 dan dibayar online melalui QRIS. Rincian tiap paket ada di halaman Paket & Harga.' },
  { q: 'Apakah ada pendampingan setelah aplikasi rilis?', a: 'Ada. Kendala teknis setelah rilis diperbaiki gratis selama masa garansi aktif, dan kami mendampingi sisi server serta DevOps.' },
]

export default function ServiceAppPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero */}
        <div className="pt-36 sm:pt-40 pb-16 sm:pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Layanan Logikraf</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Jasa Pembuatan <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">Aplikasi Web &amp; Sistem Informasi</span> untuk Bisnis
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Kami membangun aplikasi web khusus — kasir/POS, inventory, penjualan online, hingga sistem informasi internal — untuk UMKM sampai perusahaan.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link to="/paket" className="btn-primary">Lihat Paket &amp; Harga</Link>
                <Link to="/kontak" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-border-minimal text-text-main font-semibold hover:bg-white transition-colors">Konsultasi Gratis</Link>
              </div>
            </div>
          </div>
        </div>
        {/* Jenis aplikasi */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-3">
              Jenis Aplikasi Web yang Kami Bangun
            </h2>
            <p className="text-text-muted text-sm sm:text-base font-body">
              Dibangun menyesuaikan proses bisnis Anda, bukan memaksa Anda mengikuti alur template.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {appTypes.map((a) => (
              <div key={a.title} className="bg-white rounded-2xl border border-border-minimal p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="font-display font-bold text-base text-text-main mb-2">{a.title}</h3>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Website UMKM & landing page */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="bg-white rounded-3xl border border-border-minimal p-8 sm:p-12">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-3">
                Jasa Pembuatan Website UMKM &amp; Landing Page
              </h2>
              <p className="text-text-muted text-sm sm:text-base font-body">
                Selain aplikasi, kami membangun website profil bisnis, landing page penawaran, sampai toko online lengkap.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border-minimal p-6">
                <h3 className="font-display font-bold text-sm text-text-main mb-2">Website Profil &amp; Landing Page</h3>
                <p className="text-text-muted text-xs leading-relaxed font-body">Profil bisnis, halaman produk/jasa, galeri, kontak, peta lokasi, dan tombol WhatsApp untuk calon pelanggan.</p>
              </div>
              <div className="rounded-2xl border border-border-minimal p-6">
                <h3 className="font-display font-bold text-sm text-text-main mb-2">Website Bisnis &amp; Katalog</h3>
                <p className="text-text-muted text-xs leading-relaxed font-body">Katalog produk, form order, booking, artikel/blog, promo, database pelanggan, dan dashboard admin.</p>
              </div>
              <div className="rounded-2xl border border-border-minimal p-6">
                <h3 className="font-display font-bold text-sm text-text-main mb-2">Toko Online</h3>
                <p className="text-text-muted text-xs leading-relaxed font-body">Checkout, payment gateway, invoice, manajemen pesanan, inventory, dan laporan penjualan.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Proses kerja */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-3">
              Cara Kerja Kami
            </h2>
            <p className="text-text-muted text-sm sm:text-base font-body">
              Transparan sejak konsultasi sampai aplikasi dipakai.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl border border-border-minimal p-6">
                <div className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600 mb-3">{s.n}</div>
                <h3 className="font-display font-bold text-sm text-text-main mb-2">{s.t}</h3>
                <p className="text-text-muted text-xs leading-relaxed font-body">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="bg-canvas-overlay rounded-3xl border border-border-minimal p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-2 text-center">
              Pertanyaan Seputar Jasa Aplikasi Web
            </h2>
            <p className="text-text-muted text-xs sm:text-sm font-body text-center mb-8">
              Hal yang paling sering ditanyakan calon klien sebelum mulai.
            </p>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="bg-white border border-border-minimal rounded-xl p-5">
                  <summary className="cursor-pointer font-display font-semibold text-text-main text-sm sm:text-base list-none">{f.q}</summary>
                  <p className="mt-3 text-text-muted text-xs sm:text-sm leading-relaxed font-body">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
        {/* CTA */}
        <div className="container-narrow pb-20 sm:pb-24 px-4">
          <div className="bg-canvas-dark rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-blue-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-4">
                Ceritakan kebutuhan sistem Anda
              </h2>
              <p className="text-white/70 text-sm sm:text-base font-body mb-8">
                Konsultasi awal gratis. Kami bantu petakan fitur, perkiraan biaya, dan urutan pengerjaannya.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/kontak" className="btn-primary bg-white text-text-main hover:bg-white/90">Mulai Konsultasi</Link>
                <Link to="/paket" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">Lihat Harga Paket</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
