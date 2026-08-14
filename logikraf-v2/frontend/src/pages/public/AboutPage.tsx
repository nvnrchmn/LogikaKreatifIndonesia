import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

export default function AboutPage() {
  const stats = [
    { num: '50+', label: 'Proyek Selesai & Rilis', desc: 'Solusi website, aplikasi mobile, dan platform enterprise.' },
    { num: '30+', label: 'Klien Terpercaya', desc: 'Mulai dari UMKM, startup, hingga institusi korporasi.' },
    { num: '99%', label: 'Kepuasan & SLA', desc: 'Dedikasi tinggi terhadap kualitas kode dan stabilitas sistem.' },
    { num: '24/7', label: 'Infrastruktur Siap', desc: 'Pemeliharaan server dan monitoring berkelanjutan.' },
  ]

  const values = [
    { title: 'Logika & Presisi', desc: 'Setiap baris kode dibangun dengan arsitektur bersih, teruji, dan scalable untuk masa depan.' },
    { title: 'Kreativitas Visual', desc: 'Desain bukan sekadar estetika, melainkan pengalaman pengguna yang intuitif dan memikat.' },
    { title: 'Transparansi Penuh', desc: 'Komunikasi terbuka, penetapan harga jujur, dan timeline yang dapat dipertanggungjawabkan.' },
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero Section */}
        <div className="pt-36 sm:pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Tentang Logika Kreatif Indonesia</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Menjembatani <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">Logika Teknologi</span> &amp; <br className="hidden sm:inline" />
                Eksekusi Kreativitas
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                PT. Logika Kreatif Indonesia (Logikraf) adalah Digital Creative Agency &amp; Software House yang berfokus pada penciptaan produk digital berstandar industri tinggi.
              </p>
            </div>

            {/* Story & Visual Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-24">
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
                <span className="text-xs font-extrabold text-brand-primary uppercase tracking-widest block">Cerita &amp; Filosofi</span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-main leading-snug">
                  Kami Mengubah Tantangan Kompleks Menjadi Solusi Digital yang Elegan
                </h2>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed font-body">
                  Berawal dari keyakinan bahwa rekayasa perangkat lunak terbaik harus berpadu harmonis dengan desain visual yang intuitif, <strong>Logikraf</strong> hadir mendampingi para pendiri bisnis, UMKM, dan korporasi mewujudkan visi digital mereka.
                </p>
                <p className="text-text-muted text-sm sm:text-base leading-relaxed font-body">
                  Kami mengombinasikan tumpukan teknologi modern (Go, React, TypeScript, Cloud Native Infrastructure) dengan metodologi UI/UX berbasis prinsip heuristik internasional, memastikan produk yang dirilis cepat, aman, dan memikat pengguna.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-24">
              {stats.map((s, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-border-minimal shadow-sm hover:shadow-md transition-all">
                  <span className="block font-display font-extrabold text-3xl sm:text-4xl text-brand-primary mb-2">
                    {s.num}
                  </span>
                  <h4 className="font-bold text-text-main text-sm sm:text-base mb-1">{s.label}</h4>
                  <p className="text-text-muted text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Core Values */}
            <div className="mb-24">
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

            {/* Legal Entity & Office Box */}
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
                  <p className="text-xs text-text-muted">PT. Logika Kreatif Indonesia</p>
                </div>

                <div className="pt-4 md:pt-0 md:pl-6">
                  <div className="w-12 h-12 bg-canvas-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <h4 className="font-bold text-text-main text-sm mb-1">Lokasi Kantor</h4>
                  <p className="text-xs text-text-muted">Jakarta, DKI Jakarta, Indonesia</p>
                </div>

                <div className="pt-4 md:pt-0 md:pl-6">
                  <div className="w-12 h-12 bg-canvas-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <h4 className="font-bold text-text-main text-sm mb-1">Kontak Resmi</h4>
                  <p className="text-xs text-text-muted">support@logikraf.id<br />+62 812-3456-7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
