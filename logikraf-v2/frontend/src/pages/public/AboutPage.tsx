import PublicLayout from '../../components/layout/PublicLayout'
export default function AboutPage() {
  return (
    <PublicLayout>
    <div className="min-h-screen bg-canvas-light">
      <div className="pt-32 pb-20">
        <div className="container-narrow">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-6 leading-tight tracking-tight">
              Menghidupkan Visi melalui <span className="text-brand-primary">Logika & Kreativitas</span>
            </h1>
            <p className="text-text-muted font-body text-lg leading-relaxed">
              PT. Logika Kreatif Indonesia adalah Software House dan IT Solutions yang berpusat pada inovasi. Kami mengubah ide kompleks menjadi produk digital yang indah, fungsional, dan berdampak nyata bagi bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            <div className="aspect-square bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 rounded-3xl p-8 flex items-center justify-center relative overflow-hidden border border-white">
              <div className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <img src="/logo.png" alt="Logikraf" className="w-24 h-24 object-contain" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-text-main mb-6">Cerita Kami</h2>
              <p className="text-text-main font-body leading-relaxed mb-6">
                Berawal dari keyakinan bahwa teknologi yang kuat harus dibarengi dengan desain yang luar biasa, <strong>Logikraf</strong> didirikan untuk menjembatani jurang antara engineer dan seniman. Kami tidak sekadar merakit kode; kami merancang ekosistem.
              </p>
              <p className="text-text-main font-body leading-relaxed mb-8">
                Saat ini, selain mengerjakan proyek IT Solutions khusus, Logikraf juga mengembangkan dan menyediakan perangkat lunak berbasis langganan (SaaS) untuk membantu UMKM hingga korporasi menengah mendigitalisasi operasional mereka tanpa pusing memikirkan infrastruktur.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border-minimal shadow-sm">
                  <h4 className="text-3xl font-display font-bold text-brand-primary mb-2">50+</h4>
                  <p className="text-sm font-semibold text-text-muted">Proyek Selesai</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-minimal shadow-sm">
                  <h4 className="text-3xl font-display font-bold text-brand-accent mb-2">99%</h4>
                  <p className="text-sm font-semibold text-text-muted">Kepuasan Klien</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 border border-border-minimal shadow-sm">
            <h3 className="text-2xl font-display font-bold text-text-main mb-8 text-center">Identitas Perusahaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-canvas-light rounded-xl flex items-center justify-center mx-auto mb-4 text-text-muted">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h4 className="font-bold text-text-main mb-2">Entitas Hukum</h4>
                <p className="text-sm text-text-muted">PT. Logika Kreatif Indonesia</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-canvas-light rounded-xl flex items-center justify-center mx-auto mb-4 text-text-muted">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h4 className="font-bold text-text-main mb-2">Alamat Operasional</h4>
                <p className="text-sm text-text-muted">Gedung Inovasi Lt. 3, Jl. Sudirman No. 123, Jakarta Selatan, 12190</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-canvas-light rounded-xl flex items-center justify-center mx-auto mb-4 text-text-muted">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <h4 className="font-bold text-text-main mb-2">Kontak Dukungan</h4>
                <p className="text-sm text-text-muted">hello@logikraf.id<br/>+62 811-1234-5678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}
