import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

const industries = [
  { icon: '🧾', t: 'Kasir & Penjualan Toko', d: 'Katalog produk, varian, promo/voucher, transaksi penjualan, sampai laporan harian.' },
  { icon: '📦', t: 'Stok & Inventori', d: 'Pencatatan stok barang, mutasi masuk-keluar, dan pemantauan ketersediaan produk.' },
  { icon: '🧺', t: 'Jasa, Laundry & Booking', d: 'Penerimaan pesanan, penjadwalan, notifikasi ke pelanggan, dan riwayat transaksi.' },
  { icon: '🔧', t: 'Bengkel & Otomotif', d: 'Order jasa servis, inventori suku cadang, dan riwayat pelanggan per unit kendaraan.' },
  { icon: '💊', t: 'Apotek & Klinik', d: 'Katalog produk, pencatatan stok, manajemen pesanan, invoice, dan laporan penjualan.' },
  { icon: '🏢', t: 'Administrasi Internal & Absensi', d: 'Dashboard admin, data karyawan, pencatatan kehadiran, serta kontrol akses per peran.' },
  { icon: '🏘️', t: 'RT/RW & Perumahan', d: 'Iuran warga via QRIS, buku kas, sensus warga, fasilitas, dan keluhan — produk siap pakai.' },
]

const faqs = [
  { q: 'Bisakah sistem disesuaikan dengan alur kerja usaha saya?', a: 'Bisa. Kami membangun aplikasi mengikuti proses bisnis Anda, bukan memaksa Anda menyesuaikan diri dengan template yang sudah jadi.' },
  { q: 'Apakah kasir, stok, dan laporan bisa digabung dalam satu aplikasi?', a: 'Bisa. Satu aplikasi dapat mencakup penjualan, persediaan, pelanggan, invoice, dan laporan sekaligus.' },
  { q: 'Apakah aplikasinya bisa dibuka dari ponsel?', a: 'Bisa. Aplikasi dibangun sebagai web app sehingga dapat diakses lewat browser di desktop maupun ponsel.' },
  { q: 'Berapa biaya dan bagaimana pembayarannya?', a: 'Biaya paket mulai Rp 1.499.000 dan dibayar online melalui QRIS. Rincian tiap paket ada di halaman Paket & Harga.' },
  { q: 'Untuk perumahan atau RT/RW, apakah ada produk yang sudah jadi?', a: 'Ada. SmartHub by Logikraf sudah berjalan dan menangani iuran QRIS, buku kas, sensus warga, sampai keluhan warga.' },
]
export default function SolutionsPage() {
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
                <span>Solusi Logikraf</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Sistem Digital untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">Berbagai Jenis Usaha</span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Kami membangun aplikasi yang mengikuti alur kerja Anda — dari kasir dan stok, jasa dan booking, administrasi internal, sampai tata kelola perumahan.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link to="/kontak" className="btn-primary">Konsultasi Gratis</Link>
                <Link to="/paket" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-border-minimal text-text-main font-semibold hover:bg-canvas-overlay transition-colors">Lihat Paket &amp; Harga</Link>
              </div>
            </div>
          </div>
        </div>
        {/* Industri */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-3">
              Pilih Bidang Usaha Anda
            </h2>
            <p className="text-text-muted text-sm sm:text-base font-body">
              Setiap sistem dibangun menyesuaikan kebutuhan, bukan sekadar mengganti nama pada template.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((i) => (
              <div key={i.t} className="bg-white rounded-2xl border border-border-minimal p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{i.icon}</div>
                <h3 className="font-display font-bold text-base text-text-main mb-2">{i.t}</h3>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Tautan layanan */}
        <div className="container-narrow pb-16 px-4">
          <p className="text-center text-text-muted text-sm font-body">
            Butuh aplikasi web custom?{' '}
            <Link to="/jasa-pembuatan-aplikasi-web" className="text-brand-primary font-semibold hover:underline">Lihat layanan pembuatan aplikasi web</Link>
            {' '}atau{' '}
            <Link to="/aplikasi-manajemen-perumahan" className="text-brand-primary font-semibold hover:underline">aplikasi manajemen perumahan</Link>.
          </p>
        </div>

        {/* FAQ */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-2 text-center">
            Pertanyaan Umum
          </h2>
          <p className="text-text-muted text-xs text-center mb-8">Hal yang paling sering ditanyakan sebelum mulai.</p>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="bg-white border border-border-minimal rounded-xl p-5">
                <summary className="cursor-pointer font-display font-semibold text-text-main text-sm sm:text-base list-none">{f.q}</summary>
                <p className="mt-3 text-text-muted text-xs sm:text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="container-narrow pb-20 sm:pb-24 px-4">
          <div className="bg-canvas-dark rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-blue-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-4">
                Belum yakin sistem seperti apa yang Anda butuhkan?
              </h2>
              <p className="text-white/70 text-sm sm:text-base font-body mb-8">
                Ceritakan alur kerja Anda, kami bantu petakan fitur, perkiraan biaya, dan urutan pengerjaannya.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/kontak" className="btn-primary bg-white text-text-main hover:bg-white/90">Mulai Konsultasi</Link>
                <Link to="/jasa-pembuatan-aplikasi-web" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">Lihat Layanan Aplikasi Web</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
