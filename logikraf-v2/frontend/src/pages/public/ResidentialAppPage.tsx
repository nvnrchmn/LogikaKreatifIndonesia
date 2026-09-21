import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

const features = [
  { icon: '💳', t: 'Iuran & Kas via QRIS', d: 'Pembayaran iuran bulanan warga memakai QRIS dinamis lewat payment gateway berlisensi.' },
  { icon: '📒', t: 'Buku Kas Digital', d: 'Pencatatan kas masuk dan keluar, tunai maupun digital, dengan rekap otomatis.' },
  { icon: '🪪', t: 'Sensus Warga Terenkripsi', d: 'Data diri warga sesuai KTP plus nomor KK, tersimpan terenkripsi dan terkontrol aksesnya.' },
  { icon: '⏰', t: 'Pengingat Tunggakan', d: 'Notifikasi otomatis untuk iuran yang belum dibayar, mengurangi penagihan manual.' },
  { icon: '🏠', t: 'Manajemen Rumah', d: 'Data rumah per blok dan nomor, daya listrik, luas bangunan, dan luas tanah.' },
  { icon: '🏟️', t: 'Peminjaman Fasilitas', d: 'Pengajuan dan persetujuan pemakaian fasilitas lingkungan seperti lapangan dan aula.' },
  { icon: '📣', t: 'Pengumuman & Keluhan', d: 'Pengurus menyiarkan informasi, warga melaporkan keluhan lewat satu kanal.' },
  { icon: '👥', t: 'Multi-Role & Multi-Tenant', d: 'Peran RT, RW, dan warga dengan kontrol akses terpisah, siap untuk banyak perumahan.' },
]

const faqs = [
  { q: 'Apa itu aplikasi manajemen perumahan SmartHub?', a: 'SmartHub adalah platform SaaS tata kelola perumahan buatan Logikraf yang menyatukan pembayaran iuran, buku kas, sensus warga, fasilitas, dan keluhan dalam satu aplikasi untuk pengurus RT/RW beserta warganya.' },
  { q: 'Bagaimana warga membayar iuran?', a: 'Warga membayar iuran melalui QRIS dinamis yang diproses payment gateway berlisensi, dan status pembayaran tercatat otomatis pada kas lingkungan.' },
  { q: 'Apakah data warga aman?', a: 'Data kependudukan disimpan terenkripsi dan aksesnya dibatasi sesuai peran pengguna, sehingga tidak semua orang dapat membukanya.' },
  { q: 'Bisakah dipakai untuk beberapa perumahan sekaligus?', a: 'Bisa. SmartHub dirancang multi-tenant dan multi-role, sehingga satu sistem dapat melayani beberapa lingkungan dengan data yang terpisah.' },
  { q: 'Apakah Logikraf membangun aplikasi serupa untuk kebutuhan khusus?', a: 'Ya. SmartHub adalah contoh yang sudah berjalan; kami juga membangun aplikasi web custom lain sesuai proses bisnis Anda.' },
]
export default function ResidentialAppPage() {
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
                <span>Produk: SmartHub by Logikraf</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Aplikasi Manajemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">Perumahan &amp; RT/RW</span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Platform SaaS yang sudah berjalan: urus iuran dan kas, sensus warga, peminjaman fasilitas, sampai keluhan warga dalam satu aplikasi — untuk pengurus RT/RW dan warganya.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link to="/kontak" className="btn-primary">Minta Demo</Link>
                <Link to="/portfolio/smarthub-by-logikraf" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-border-minimal text-text-main font-semibold hover:bg-canvas-overlay transition-colors">Lihat Studi Kasus</Link>
              </div>
            </div>
          </div>
        </div>
        {/* Fitur */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-3">
              Fitur untuk Pengurus dan Warga
            </h2>
            <p className="text-text-muted text-sm sm:text-base font-body">
              Administrasi lingkungan tersentralisasi dalam satu aplikasi, tidak lagi tersebar di buku kas dan grup pesan.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.t} className="bg-white rounded-2xl border border-border-minimal p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display font-bold text-sm text-text-main mb-2">{f.t}</h3>
                <p className="text-text-muted text-xs leading-relaxed font-body">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Untuk siapa */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-border-minimal p-6">
              <h3 className="font-display font-bold text-base text-text-main mb-2">Pengurus RT/RW</h3>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body">
                Rekap kas bulanan, pengumuman, penagihan iuran, dan monitoring aktivitas warga berjalan otomatis.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border-minimal p-6">
              <h3 className="font-display font-bold text-base text-text-main mb-2">Warga</h3>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body">
                Bayar iuran lewat QRIS, ajukan pemakaian fasilitas, dan laporkan keluhan tanpa harus datang ke sekretariat.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border-minimal p-6">
              <h3 className="font-display font-bold text-base text-text-main mb-2">Pengelola &amp; Developer</h3>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body">
                Arsitektur multi-tenant memungkinkan satu sistem melayani banyak perumahan dengan data yang terpisah.
              </p>
            </div>
          </div>
        </div>

        {/* Bukti & teknologi */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <div className="bg-canvas-overlay rounded-3xl border border-border-minimal p-8 sm:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-4">
                Sudah Berjalan, Bukan Konsep
              </h2>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed font-body mb-6">
                SmartHub dibangun dengan arsitektur backend Go, frontend React, dan MySQL, serta dirancang multi-tenant dan multi-role. Sistem ini menjadi bukti Logikraf membangun platform SaaS dengan integrasi pembayaran, bukan sekadar situs profil.
              </p>
              <Link to="/portfolio/smarthub-by-logikraf" className="btn-primary">Baca Studi Kasus SmartHub</Link>
            </div>
          </div>
        </div>
        {/* FAQ */}
        <div className="container-narrow pb-16 sm:pb-20 px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-text-main tracking-tight mb-2 text-center">
            Pertanyaan Seputar Aplikasi Perumahan
          </h2>
          <div className="max-w-3xl mx-auto space-y-3 mt-8">
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
                Ingin sistem seperti ini untuk lingkungan Anda?
              </h2>
              <p className="text-white/70 text-sm sm:text-base font-body mb-8">
                Kami bantu petakan kebutuhan RT/RW atau perumahan Anda, lalu tunjukkan alur kerjanya lewat demo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/kontak" className="btn-primary bg-white text-text-main hover:bg-white/90">Minta Demo</Link>
                <Link to="/paket" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">Lihat Harga Paket</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
