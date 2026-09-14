import { Link } from 'react-router-dom'

// Section "Profil Perusahaan" untuk landing page logikraf.id.
// Salinan (copy) diambil apa adanya dari draf pemilik.

const services = [
  { title: 'Custom Software Development', desc: 'Pengembangan aplikasi berbasis web dan mobile yang disesuaikan secara spesifik dengan alur kerja, skala, dan proses bisnis Anda.' },
  { title: 'Solusi SaaS Komunitas (Smarthub)', desc: 'Ekosistem manajemen lingkungan terpadu untuk RT/RW, perumahan, dan paguyuban — mencakup otomatisasi iuran warga, administrasi digital, dan forum interaksi.' },
  { title: 'Integrasi Sistem & Pembayaran', desc: 'Implementasi arsitektur cloud, API pihak ketiga, serta integrasi payment gateway untuk transaksi keuangan otomatis dan aman.' },
  { title: 'Konsultasi TI & Transformasi Digital', desc: 'Pendampingan teknis mulai dari audit infrastruktur, optimalisasi basis data, hingga strategi modernisasi sistem legasi.' },
]

const values = [
  { title: 'Presisi Arsitektural', desc: 'Kode yang bersih, modular, dan dirancang untuk performa tinggi serta kemudahan perawatan jangka panjang.' },
  { title: 'Skalabilitas Tanpa Hambatan', desc: 'Fondasi sistem disiapkan untuk tumbuh selaras dengan ekspansi bisnis Anda.' },
  { title: 'Pendekatan Berorientasi Hasil', desc: 'Solusi praktis yang langsung menjawab friksi operasional, bukan sekadar implementasi teknologi tanpa dampak nyata.' },
]

export default function CompanyProfile() {
  return (
    <section id="profil" className="section-padding bg-canvas-overlay">
      <div className="container-narrow">
        <div className="max-w-3xl mb-12">
          <span className="badge badge-info mb-4 inline-block">Profil Perusahaan</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main mb-6">
            Mengintegrasikan Logika Rekayasa dan Inovasi Digital untuk Solusi Bisnis yang Terukur
          </h2>
          <p className="font-body text-lg text-text-muted leading-relaxed">
            <strong className="text-text-main">PT Logika Kreatif Indonesia (Logikraf)</strong> adalah studio rekayasa perangkat lunak dan konsultan transformasi digital. Kami merancang solusi teknologi yang presisi — memadukan arsitektur sistem yang solid (<em>logic</em>) dengan pengalaman pengguna yang intuitif (<em>craft</em>) guna membantu bisnis, organisasi, dan komunitas beroperasi lebih efisien.
          </p>
        </div>

        <h3 className="font-display text-xl font-bold text-text-main mb-6">Layanan Utama</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {services.map((s) => (
            <div key={s.title} className="card p-6">
              <h4 className="font-display text-lg font-bold text-text-main mb-2">{s.title}</h4>
              <p className="font-body text-text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="font-display text-xl font-bold text-text-main mb-6">Nilai Keunggulan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {values.map((v) => (
            <div key={v.title} className="card p-6">
              <h4 className="font-display text-base font-bold text-text-main mb-2">{v.title}</h4>
              <p className="font-body text-sm text-text-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-canvas-dark p-8 sm:p-10 text-center">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">Siap Membangun Solusi Digital Anda?</h3>
          <p className="font-body text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
            Diskusikan kebutuhan teknis bisnis Anda bersama kami dan bangun fondasi sistem yang andal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#konsultasi" className="btn-primary text-base px-8 py-4">Mulai Konsultasi</a>
            <Link to="/paket" className="btn-primary bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-base px-8 py-4">Pelajari Produk Kami</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
