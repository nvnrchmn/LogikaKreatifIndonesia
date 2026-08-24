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
  const contactWhatsapp = settings.contact_whatsapp || '+62 898 3342 429'
  const contactAddress = settings.contact_address || 'Jakarta, DKI Jakarta, Indonesia'
  const cleanWaNumber = contactWhatsapp.replace(/[^0-9]/g, '')

  return (
    <footer className="bg-canvas-dark border-t border-white/10 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-narrow py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
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

          {/* Direct Support Column */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider text-brand-accent">
              Helpdesk &amp; Legal
            </h4>
            <div className="space-y-2.5 text-xs text-text-light/70">
              <p>Email: <a href={`mailto:${contactEmail}`} className="text-white hover:underline font-mono">{contactEmail}</a></p>
              <p>WhatsApp: <a href={`https://wa.me/${cleanWaNumber || '628983342429'}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-mono">{contactWhatsapp}</a></p>
              <p className="leading-relaxed whitespace-pre-line">Kantor: {contactAddress}</p>
            </div>
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWaNumber || '628983342429'}`}
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
            <Link to="/kebijakan-refund" className="hover:text-white transition-colors">Kebijakan Pengembalian Dana (Refund)</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
