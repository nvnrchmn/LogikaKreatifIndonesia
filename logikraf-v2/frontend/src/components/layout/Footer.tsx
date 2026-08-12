import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-canvas-dark border-t-2 border-brand-primary">
      <div className="container-narrow py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Logikraf" className="h-10 w-auto object-contain shrink-0" />
              <span className="font-display font-bold text-xl text-white tracking-tight mt-1">LOGIKRAF</span>
            </Link>
            <p className="text-sm text-text-light/70 font-body leading-relaxed max-w-md mb-6">
              PT. Logika Kreatif Indonesia — Software House dan IT Solutions yang menjembatani solusi berbasis logika teknologi dengan eksekusi kreativitas visual. Membangun produk digital yang berdampak.
            </p>
            <div className="flex items-center gap-4">
              <a href="mailto:hello@logikraf.id" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-brand-primary/20 flex items-center justify-center transition-all" aria-label="Email">
                <svg className="w-5 h-5 text-text-light/50 hover:text-brand-primary transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
              </a>
              <a href="https://wa.me/6281112345678" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-brand-primary/20 flex items-center justify-center transition-all" aria-label="WhatsApp">
                <svg className="w-5 h-5 text-text-light/50 hover:text-brand-primary transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-6">Navigasi</h4>
            <ul className="space-y-3">
              <li><Link to="/layanan" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Layanan</Link></li>
              <li><Link to="/paket" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Paket</Link></li>
              <li><Link to="/portfolio" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Portofolio</Link></li>
              <li><Link to="/blog" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Blog</Link></li>
              <li><Link to="/tentang-kami" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Tentang</Link></li>
              <li><Link to="/kontak" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-6">Layanan</h4>
            <ul className="space-y-3">
              <li><Link to="/layanan/software-development" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Software Development</Link></li>
              <li><Link to="/layanan/ui-ux-design" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">UI/UX Design</Link></li>
              <li><Link to="/layanan/digital-marketing" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Digital Marketing</Link></li>
              <li><Link to="/layanan/branding" className="text-text-light/60 hover:text-brand-primary font-body text-sm transition-colors">Branding</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text-light/40 font-body text-xs">
              &copy; {new Date().getFullYear()} PT. Logika Kreatif Indonesia. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/faq" className="text-text-light/40 hover:text-text-light/70 font-body text-xs transition-colors">FAQ</Link>
              <Link to="/syarat-ketentuan" className="text-text-light/40 hover:text-text-light/70 font-body text-xs transition-colors">Syarat & Ketentuan</Link>
              <Link to="/kebijakan-privasi" className="text-text-light/40 hover:text-text-light/70 font-body text-xs transition-colors">Kebijakan Privasi</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
