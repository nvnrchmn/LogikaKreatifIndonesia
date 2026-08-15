import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Service {
  id: number
  name: string
  slug: string
  short_desc: string
  color: string
  icon?: string
  features?: string[]
}

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/services')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setError('Gagal memuat layanan'))
      .finally(() => setLoading(false))
  }, [])

  const displayServices: Service[] = useMemo(() => {
    if (items.length > 0) return items
    return [
      {
        id: 1,
        name: 'Custom Web Application Development',
        slug: 'web-application-development',
        short_desc: 'Membangun aplikasi web skala enterprise, SaaS multi-tenant, dan portal internal dengan arsitektur Go Fiber dan React modern.',
        color: '#0b66c2',
        features: ['React & Next.js Frontend', 'Go Fiber High-Throughput Backend', 'PostgreSQL / MySQL Schema Design', 'Multi-Tenant RBAC Security'],
      },
      {
        id: 2,
        name: 'Mobile App Development (iOS & Android)',
        slug: 'mobile-app-development',
        short_desc: 'Aplikasi seluler native & cross-platform dengan performa 60 FPS, sinkronisasi offline-first, dan integrasi push notification.',
        color: '#10b981',
        features: ['Flutter & React Native', 'Offline-First Data Sync', 'Biometric & Push Notifications', 'App Store & Play Store Publishing'],
      },
      {
        id: 3,
        name: 'Fintech & QRIS Payment Gateway Integration',
        slug: 'payment-gateway-integration',
        short_desc: 'Integrasi sistem pembayaran multi-channel resmi Bank Indonesia (QRIS Dinamis, Virtual Account Bank, dan E-Wallet).',
        color: '#8b5cf6',
        features: ['QRIS Dinamis Otomatis', 'Webhook Settlement Reconciliation', 'Multi-Gateway (iPaymu / Midtrans / Xendit)', '256-Bit SSL Encryption'],
      },
      {
        id: 4,
        name: 'UI/UX Design & Product Design System',
        slug: 'ui-ux-design-system',
        short_desc: 'Perancangan antarmuka pengguna berbasis riset neuro-design, wireframing interaktif, dan token design system terstandar.',
        color: '#f59e0b',
        features: ['Figma Component Design System', 'User Journey & Empathy Mapping', 'Interactive Prototyping', 'Usability Testing & Micro-Interactions'],
      },
      {
        id: 5,
        name: 'Cloud Infrastructure & DevOps Modernization',
        slug: 'cloud-infrastructure-devops',
        short_desc: 'Arsitektur cloud scalable, automated CI/CD pipeline, containerization Docker/K8s, dan monitoring uptime server 99.9%.',
        color: '#06b6d4',
        features: ['Docker & Container Orchestration', 'Automated CI/CD Deployment', 'Cloudflare CDN & DDoS Shield', 'Real-Time Health Monitoring'],
      },
      {
        id: 6,
        name: 'Transformasi Digital & Website UMKM',
        slug: 'transformasi-digital-umkm',
        short_desc: 'Digitalisasi profil bisnis dan etalase digital UMKM dengan kecepatan loading super cepat, SEO on-page, dan optimasi mobile.',
        color: '#ec4899',
        features: ['SEO Google Indexing Ready', 'Fast PageSpeed 95+ Score', 'Integrasi Chat WhatsApp Bisnis', 'Free Domain & Cloud Hosting 1 Tahun'],
      },
    ]
  }, [items])

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero Section */}
        <div className="pt-36 sm:pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Suite Layanan Rekayasa Perangkat Lunak</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Solusi Rekayasa Digital <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-600 to-indigo-600">
                  Taraf Enterprise
                </span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Dari platform web custom, pembayaran QRIS otomatis, hingga arsitektur cloud berkinerja tinggi yang dirancang untuk skala bisnis Anda.
              </p>
            </div>

            {error && (
              <div className="max-w-xl mx-auto mb-10 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
                {error} (Menampilkan katalog layanan unggulan).
              </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
              {displayServices.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="group bg-white rounded-3xl p-8 border border-border-minimal shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-13 h-13 rounded-2xl bg-brand-primary/10 flex items-center justify-center p-3 text-brand-primary group-hover:scale-110 transition-transform">
                        <img src="/logo.png" alt="Logikraf" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold font-mono text-text-muted/60 uppercase tracking-widest">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-text-main group-hover:text-brand-primary transition-colors mb-3 leading-snug">
                      {s.name}
                    </h3>
                    <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body mb-6">
                      {s.short_desc}
                    </p>

                    {/* Features list */}
                    {s.features && (
                      <div className="space-y-2 mb-6 pt-4 border-t border-border-minimal/50">
                        {s.features.map((f, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-border-minimal flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-muted">Konsultasi Gratis</span>
                    <Link
                      to="/kontak"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary/80 group-hover:translate-x-1 transition-all"
                    >
                      <span>Mulai Diskusi</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Tech Stack Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-canvas-dark via-gray-900 to-canvas-dark p-8 sm:p-12 text-white border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                  Stack Teknologi Teruji
                </span>
                <h3 className="font-display font-extrabold text-2xl text-white">
                  Dibangun dengan Standar Kinerja &amp; Keamanan Tinggi
                </h3>
                <p className="text-xs sm:text-sm text-text-light/70 leading-relaxed">
                  Kami memanfaatkan Go Fiber, React, PostgreSQL, Docker, dan integrasi QRIS Bank Indonesia untuk memastikan aplikasi Anda cepat, aman, dan siap scale.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                {['Go (Golang)', 'React 19', 'TypeScript', 'PostgreSQL', 'TailwindCSS v4', 'QRIS BI'].map(t => (
                  <span
                    key={t}
                    className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-bold font-mono text-white shadow-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
