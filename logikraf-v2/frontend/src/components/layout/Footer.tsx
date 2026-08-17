import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => (r.ok ? r.json() : {}))
      .then(d => setSettings(d || {}))
      .catch(() => {})
  }, [])

  const companyName = settings.company_name || 'PT. Logika Kreatif Indonesia'
  const contactEmail = settings.contact_email || 'support@logikraf.id'
  const contactWhatsapp = settings.contact_whatsapp || '+62 812-3456-7890'
  const contactAddress = settings.contact_address || 'Jakarta, DKI Jakarta, Indonesia'
  const cleanWaNumber = contactWhatsapp.replace(/[^0-9]/g, '')

  return (
    <footer className="bg-canvas-dark border-t border-white/10 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-narrow py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Company Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="Logikraf" className="h-10 w-auto object-contain shrink-0" />
              <span className="font-display font-black text-2xl text-white tracking-tight">LOGIKRAF</span>
            </Link>
            <p className="text-xs sm:text-sm text-text-light/70 font-body leading-relaxed max-w-md">
              <strong>{companyName}</strong> — Software House &amp; Konsultan Transformasi Digital. Menghadirkan solusi arsitektur aplikasi berkinerja tinggi, UI/UX modern, dan integrasi pembayaran QRIS resmi Bank Indonesia.
            </p>

            {/* Payment & Security Trust Badges */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-light/50 block mb-2.5">
                Metode Pembayaran Resmi
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>QRIS Nasional</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-text-light/80 text-xs font-medium">
                  <span>🔒 256-Bit SSL</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-text-light/80 text-xs font-medium">
                  <span>⚡ iPaymu Gateway</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider text-brand-accent">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/paket" className="text-text-light/70 hover:text-white transition-colors">Layanan</Link></li>
              <li><Link to="/paket" className="text-text-light/70 hover:text-white transition-colors">Paket Website</Link></li>
              <li><Link to="/#portfolio" className="text-text-light/70 hover:text-white transition-colors">Portofolio</Link></li>
              <li><Link to="/blog" className="text-text-light/70 hover:text-white transition-colors">Artikel &amp; Blog</Link></li>
              <li><Link to="/tentang-kami" className="text-text-light/70 hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link to="/kontak" className="text-text-light/70 hover:text-white transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>

          {/* Solution & Services */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider text-brand-accent">
              Layanan Utama
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/paket" className="text-text-light/70 hover:text-white transition-colors">Web Application</Link></li>
              <li><Link to="/paket" className="text-text-light/70 hover:text-white transition-colors">Mobile App (iOS/Android)</Link></li>
              <li><Link to="/paket" className="text-text-light/70 hover:text-white transition-colors">UI/UX Design</Link></li>
              <li><Link to="/paket" className="text-text-light/70 hover:text-white transition-colors">Digital Branding</Link></li>
              <li><Link to="/search" className="text-text-light/70 hover:text-white transition-colors">Cari Direktori</Link></li>
            </ul>
          </div>

          {/* Direct Support Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider text-brand-accent">
              Helpdesk &amp; Legal
            </h4>
            <div className="space-y-2.5 text-xs text-text-light/70">
              <p>Email: <a href={`mailto:${contactEmail}`} className="text-white hover:underline font-mono">{contactEmail}</a></p>
              <p>WhatsApp: <a href={`https://wa.me/${cleanWaNumber || '6281234567890'}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-mono">{contactWhatsapp}</a></p>
              <p className="leading-relaxed">Kantor: {contactAddress}</p>
            </div>
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWaNumber || '6281234567890'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
              >
                <span>💬 Chat WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance Links */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-light/50">
          <p>
            &copy; {new Date().getFullYear()} {companyName}. Seluruh hak cipta dilindungi undang-undang.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link to="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</Link>
            <Link to="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link to="/syarat-ketentuan" className="hover:text-white transition-colors">Kebijakan Pengembalian Dana (Refund)</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
