import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Beranda', path: '/' },
  { label: 'Paket', path: '/paket' },
  { label: 'Blog', path: '/blog' },
  { label: 'Tentang Kami', path: '/tentang-kami' },
  { label: 'Kontak', path: '/kontak' },
]

const legalLinks = [
  { label: 'Ketentuan Layanan', path: '/tos', external: false },
  { label: 'Kebijakan Privasi', path: '/privacy', external: false },
  { label: 'FAQ', path: '/faq', external: false },
]

export default function Footer() {
  return (
    <footer className="bg-text-main text-white/80 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display font-bold text-white text-lg mb-2">Logikraf</h3>
            <p className="text-white/60 text-xs leading-relaxed mb-4">
              Digital agency Indonesia. Membangun website, aplikasi, dan solusi digital
              untuk bisnis Anda. Pembayaran aman via iPaymu.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'twitter'].map((s) => (
                <a
                  key={s}
                  href={`#${s}`}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={s}
                >
                  <span className="text-xs text-white/60">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Navigasi</h4>
            <ul className="space-y-2">
              {footerLinks.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-white/60 hover:text-white text-xs transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-white/60 hover:text-white text-xs transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/40 text-[11px]">
            © {new Date().getFullYear()} Logika Kreatif Indonesia. All rights reserved.
          </p>
          <p className="text-white/40 text-[11px]">
            Pembayaran diproses oleh pihak ketiga (iPaymu). Lihat{' '}
            <Link to="/privacy" className="underline hover:text-white/60">Kebijakan Privasi</Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
