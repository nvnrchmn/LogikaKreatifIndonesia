import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface NavbarProps {
  transparent?: boolean
  forceScrolled?: boolean
}

export default function Navbar({ transparent = true, forceScrolled = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(!transparent || forceScrolled)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/')

  useEffect(() => {
    if (!transparent && !forceScrolled) {
      setScrolled(true)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparent, forceScrolled])

  const links = [
    { to: '/layanan', label: 'Layanan' },
    { to: '/paket', label: 'Paket' },
    { to: '/portfolio', label: 'Portofolio' },
    { to: '/blog', label: 'Blog' },
    { to: '/tentang-kami', label: 'Tentang' },
    { to: '/kontak', label: 'Kontak' },
  ]

  const showSearch = true
  const showAuth = true

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-border-minimal' : 'bg-transparent'}`}>
      <div className="container-narrow flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Logikraf" className="h-10 w-auto object-contain shrink-0" />
          <span className={`font-display font-bold text-xl tracking-tight mt-1 ${scrolled ? 'text-text-main' : 'text-white'}`}>
            LOGIKRAF
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.to} to={l.to} aria-current={isActive(l.to) ? 'page' : undefined} className={`text-sm font-medium transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-brand-primary after:transition-all after:duration-200 hover:after:w-full ${isActive(l.to) ? 'after:w-full' : 'after:w-0'} ${scrolled ? (isActive(l.to) ? 'text-brand-primary' : 'text-text-muted hover:text-brand-primary') : (isActive(l.to) ? 'text-white' : 'text-white/80 hover:text-white')}`}>
              {l.label}
            </Link>
          ))}
          {showSearch && (
            <button aria-label="Cari" className={`transition-colors ${scrolled ? 'text-text-muted hover:text-brand-primary' : 'text-white/80 hover:text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          )}
          {showAuth && (
            <Link to="/admin/login" className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${scrolled ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur'}`}>
              Admin
            </Link>
          )}
          <Link to="/kontak" className="btn-primary text-sm">Mulai Proyek</Link>
        </div>

        <button className="md:hidden p-2 -mr-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-canvas-card/95 backdrop-blur border-b border-border-minimal">
          <div className="container-narrow py-4 flex flex-col gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} aria-current={isActive(l.to) ? 'page' : undefined} className={`block px-4 py-3 rounded-lg font-body text-sm font-medium ${isActive(l.to) ? 'text-brand-primary bg-brand-primary/5' : 'text-text-main hover:text-brand-primary hover:bg-brand-primary/5'}`} onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/admin/login" className="btn-primary w-full text-center text-sm" onClick={() => setMobileOpen(false)}>Admin</Link>
              <Link to="/kontak" className="btn-primary w-full text-center text-sm" onClick={() => setMobileOpen(false)}>Mulai Proyek</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
