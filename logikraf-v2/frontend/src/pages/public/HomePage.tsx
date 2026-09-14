import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import PricingSection from '../../components/public/PricingSection'
import PortfolioGallery from '../../components/public/PortfolioGallery'
import TestimonialsSection from '../../components/public/TestimonialsSection'
import ProjectBriefForm from '../../components/public/ProjectBriefForm'
import CompanyProfile from '../../components/public/CompanyProfile'

interface HeroStat {
  value: string
  label: string
}

const DEFAULT_STATS: HeroStat[] = [
  { value: '50+', label: 'Proyek Selesai' },
  { value: '30+', label: 'Klien Terpercaya' },
  { value: '4', label: 'Layanan Utama' },
  { value: '99%', label: 'Kepuasan Klien' },
]

export default function HomePage() {
  const [stats, setStats] = useState<HeroStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hero-stats')
      .then(r => (r.ok ? r.json() : { data: [] }))
      .then(d => {
        const list = Array.isArray(d) ? d : d?.data
        if (Array.isArray(list) && list.length > 0) {
          // API returns { id, num, label, sort_order } → map to { value, label }
          setStats(list.map((s: { num: string; label: string }) => ({ value: s.num, label: s.label })))
        } else {
          setStats(DEFAULT_STATS)
        }
      })
      .catch(() => setStats(DEFAULT_STATS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section id="beranda" className="relative min-h-[90vh] flex items-center bg-canvas-dark overflow-hidden">
          <div className="absolute inset-0 gradient-radial-hero" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-brand-accent/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="container-narrow relative z-10 py-20">
            <div className="max-w-4xl">
              <div className="animate-fade-in mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 font-body text-xs font-medium tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                  Software House & IT Solutions
                </span>
              </div>

              <h1 className="animate-slide-up font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8">
                Wujudkan ide digital Anda dengan <span className="text-brand-primary">teknologi terbaik</span>
              </h1>

              <p className="animate-slide-up font-body text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mb-12">
                Kami merancang, membangun, dan mengelola solusi digital yang membantu bisnis bertumbuh — dari website hingga aplikasi enterprise.
              </p>

              <div className="animate-slide-up flex flex-col sm:flex-row items-start gap-4">
                <a href="#konsultasi" className="btn-primary text-base px-8 py-4 shadow-lg shadow-brand-primary/25">Mulai Proyek Anda</a>
                <a href="#portofolio" className="btn-primary bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-base px-8 py-4">Lihat Portofolio</a>
              </div>

              <div className="animate-fade-in mt-20 flex flex-wrap items-center gap-x-6 sm:gap-x-12 gap-y-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-9 w-20 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                    </div>
                  ))
                ) : (
                  stats.map((stat, i) => (
                    <div key={i} className="contents">
                      {i > 0 && <div className="w-px h-10 bg-white/10 hidden sm:block" />}
                      <div>
                        <span className={`block font-display text-3xl font-bold ${stat.label === 'Kepuasan Klien' ? 'text-brand-accent' : 'text-white'}`}>{stat.value}</span>
                        <span className="font-body text-sm text-white/40">{stat.label}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 gradient-dark-bottom" />
        </section>

        <CompanyProfile />
        <PricingSection />
        <section id="portfolio">
          <PortfolioGallery />
        </section>
        <TestimonialsSection />
        <section id="konsultasi">
          <ProjectBriefForm />
        </section>
      </main>
      <Footer />
    </div>
  )
}