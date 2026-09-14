import { useState, useEffect } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import PortfolioGallery from '../../components/public/PortfolioGallery'
import TestimonialsSection from '../../components/public/TestimonialsSection'

interface HeroStat {
  id: number
  num: string
  label: string
  sort_order?: number
}

export default function AboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [stats, setStats] = useState<HeroStat[]>([])

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => (r.ok ? r.json() : {}))
      .then(d => setSettings(d || {}))
      .catch(() => {})
    fetch('/api/hero-stats')
      .then(r => (r.ok ? r.json() : []))
      .then(d => {
        const arr = Array.isArray(d) ? d : []
        arr.sort((a: HeroStat, b: HeroStat) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        setStats(arr)
      })
      .catch(() => {})
  }, [])

  const companyName = settings.company_name || 'PT. Logika Kreatif Indonesia'
  const companyAddress = settings.company_address || settings.contact_address || 'Jakarta, DKI Jakarta, Indonesia'
  const companyEmail = settings.company_email || 'support@logikraf.id'
  const companyPhone = settings.company_phone || settings.contact_phone || '+62 898 3342 429'

  const values = [
    { title: 'Logika & Presisi', desc: 'Setiap fitur dirancang dengan arsitektur yang bersih, kode yang teruji, dan proses yang terdokumentasi — agar mudah dikembangkan, dirawat, dan diskalakan.' },
    { title: 'Teknologi yang Mengikuti Kebutuhan', desc: 'Teknologi dipilih berdasarkan kebutuhan nyata — stabilitas, biaya operasional, dan kecepatan rilis — bukan sekadar tren. Kerja bertahap per sprint, dengan CI/CD di setiap pengiriman.' },
    { title: 'Transparansi Penuh', desc: 'Komunikasi terbuka, cakupan kerja yang jelas, harga jujur, dan timeline yang dapat dipertanggungjawabkan — termasuk akses penuh atas kode dan dokumentasi.' },
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero Section */}
        <div className="pt-36 sm:pt-40 pb-16 sm:pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Tentang Logika Kreatif Indonesia</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Software House yang Membangun <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">Produk Digital</span> hingga Produksi
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                PT. Logika Kreatif Indonesia (Logikraf) adalah software house sekaligus konsultan transformasi digital. Kami mengerjakan perangkat lunak khusus (custom software): web app, sistem informasi bisnis, integrasi pembayaran, sampai pendampingan teknis server dan DevOps.
              </p>
            </div>

            {/* Story & Visual Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-20 lg:mb-24">
              <div className="lg:col-span-5 relative">
                <div className="aspect-square bg-gradient-to-br from-brand-primary/20 via-blue-500/15 to-canvas-dark/10 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden border border-white shadow-xl">
                  <div className="w-28 h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4 mb-4 group hover:scale-105 transition-transform">
                    <img src="/logo.png" alt="Logikraf" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-text-main font-display font-extrabold text-xl tracking-tight">LOGIKRAF</span>
                  <span className="text-xs font-semibold text-text-muted mt-1">Software House &amp; IT Solutions</span>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-extrabold text-brand-primary uppercase tracking-widest block">Cara Kami Bekerja</span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-main leading-snug">
                  Dari Analisis Kebutuhan hingga Rilis &amp; Perawatan — Satu Tim yang Bertanggung Jawab
                </h2>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed font-body">
                  Kami mendampingi bisnis — mulai UMKM, perusahaan, hingga mitra produk — dalam mewujudkan sistem digital mereka. Pekerjaan dijalankan dalam <strong>sprint bertahap</strong>: analisis kebutuhan, perancangan arsitektur, pengembangan, pengujian, lalu rilis — dengan <strong>CI/CD otomatis</strong> dan dokumentasi di setiap tahap.
                </p>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed font-body">
                  Di balik layar, kami mengelola infrastruktur secara langsung: server VPS, basis data, backup, hingga monitoring 24/7. Teknologi utama kami — <strong>Go, React, TypeScript, dan ekosistem cloud-native</strong> — dipilih untuk menjamin sistem yang cepat, aman, stabil, dan mudah dirawat dalam jangka panjang.
                </p>
              </div>
            </div>

            {/* Stats Grid — data dari DB (admin) */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20 lg:mb-24">
                {stats.map((s) => (
                  <div key={s.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-border-minimal shadow-sm hover:shadow-md transition-all">
                    <span className="block font-display font-extrabold text-3xl sm:text-4xl text-brand-primary mb-2">
                      {s.num}
                    </span>
                    <h4 className="font-bold text-text-main text-sm sm:text-base mb-1">{s.label}</h4>
                  </div>
                ))}
              </div>
            )}

            {/* Core Values */}
            <div className="mb-20 lg:mb-24">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-extrabold text-brand-primary uppercase tracking-widest block mb-2">Nilai Inti</span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-text-main">Prinsip Kerja Kami</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {values.map((v, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-border-minimal shadow-sm">
                    <span className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm mb-5">
                      0{i + 1}
                    </span>
                    <h4 className="font-bold text-text-main text-lg mb-2">{v.title}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Proyek & Klien — data asli dari database (sama seperti halaman depan) */}
        <PortfolioGallery />
        <TestimonialsSection />

        {/* Legal Entity & Office Box */}
        <div className="container-narrow px-4 pb-24">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border-minimal shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-2xl font-display font-bold text-text-main">Identitas &amp; Legalitas Perusahaan</h3>
              <p className="text-text-muted text-xs sm:text-sm mt-1">Entitas resmi berbadan hukum terdaftar di Republik Indonesia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border-minimal">
              <div className="pt-4 md:pt-0">
                <div className="w-12 h-12 bg-canvas-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1">Entitas Resmi</h4>
                <p className="text-xs text-text-muted">{companyName}</p>
              </div>

              <div className="pt-4 md:pt-0 md:pl-6">
                <div className="w-12 h-12 bg-canvas-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1">Lokasi Kantor</h4>
                <p className="text-xs text-text-muted">{companyAddress}</p>
              </div>

              <div className="pt-4 md:pt-0 md:pl-6">
                <div className="w-12 h-12 bg-canvas-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <h4 className="font-bold text-text-main text-sm mb-1">Kontak Resmi</h4>
                <p className="text-xs text-text-muted">{companyEmail}<br />{companyPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
