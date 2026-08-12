export default function HeroSection() {
  return (
    <section id="beranda" className="relative min-h-[90vh] flex items-center bg-canvas-dark overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top right, rgba(0,82,255,0.15), transparent 50%)' }} />
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

          <h1 className="animate-slide-up font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8">
            Solusi Digital Berbasis Logika & Kreativitas
          </h1>

          <p className="animate-slide-up font-body text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mb-12">
            Kami membantu bisnis bertransformasi dengan solusi teknologi yang Powerful, scalable, dan user-friendly.
          </p>

          <div className="animate-slide-up flex flex-col sm:flex-row items-start gap-4">
            <a href="#konsultasi" className="btn-primary text-base !py-4 !px-8 shadow-lg shadow-brand-primary/25">Mulai Proyek Anda</a>
            <a href="/portfolio" className="btn-secondary !border-white/20 !text-white/80 hover:!bg-white/10 hover:!text-white hover:!border-white/30 text-base !py-4 !px-8">Lihat Portofolio</a>
          </div>

          <div className="animate-fade-in mt-20 flex flex-wrap items-center gap-x-12 gap-y-6">
            <div><span className="block font-display text-3xl font-bold text-white">50+</span><span className="font-body text-sm text-white/40">Proyek Selesai</span></div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div><span className="block font-display text-3xl font-bold text-white">30+</span><span className="font-body text-sm text-white/40">Klien Terpercaya</span></div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div><span className="block font-display text-3xl font-bold text-white">4</span><span className="font-body text-sm text-white/40">Layanan Utama</span></div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div><span className="block font-display text-3xl font-bold text-brand-accent">99%</span><span className="font-body text-sm text-white/40">Kepuasan Klien</span></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to top, #F8FAFC, transparent)' }} />
    </section>
  )
}
