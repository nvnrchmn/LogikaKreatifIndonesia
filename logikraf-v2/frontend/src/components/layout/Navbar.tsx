import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface NavbarProps {
  transparent?: boolean
  forceScrolled?: boolean
}

export default function Navbar({ transparent = true, forceScrolled = false }: NavbarProps) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(!isHome || !transparent || forceScrolled)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/'
    return pathname === to || pathname.startsWith(to + '/')
  }

  useEffect(() => {
    if (!isHome || !transparent || forceScrolled) {
      setScrolled(true)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome, transparent, forceScrolled, pathname])

  const links = [
    { to: '/paket', label: 'Paket' },
    { to: '/portfolio', label: 'Portofolio' },
    { to: '/blog', label: 'Blog' },
    { to: '/tentang-kami', label: 'Tentang' },
    { to: '/kontak', label: 'Kontak' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border-minimal'
        : 'bg-transparent'
    }`}>
      <div className="container-narrow flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Logikraf" className="h-9 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform" />
          <span className={`font-display font-extrabold text-xl tracking-tight transition-colors ${
            scrolled ? 'text-text-main' : 'text-white'
          }`}>
            LOGIKRAF
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => {
            const active = isActive(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? 'page' : undefined}
                className={`text-sm font-semibold transition-all relative py-1 ${
                  scrolled
                    ? active
                      ? 'text-brand-primary font-bold'
                      : 'text-text-muted hover:text-brand-primary'
                    : active
                    ? 'text-white font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />
                )}
              </Link>
            )
          })}

          <div className="flex items-center gap-3 pl-2 border-l border-border-minimal/40">
            <Link
              to="/search"
              aria-label="Cari di website"
              className={`p-2 rounded-xl transition-all ${
                scrolled
                  ? 'text-text-muted hover:text-brand-primary hover:bg-canvas-light'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="Pencarian"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link
              to="/admin/login"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                scrolled
                  ? 'text-text-muted hover:text-text-main hover:bg-canvas-light border border-border-minimal'
                  : 'text-white/90 hover:text-white hover:bg-white/15 border border-white/20'
              }`}
            >
              Admin Portal
            </Link>

            <Link
              to="/kontak"
              className="btn-primary text-xs py-2 px-4 shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-[0.98] transition-all"
            >
              Mulai Proyek 🚀
            </Link>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/search"
            aria-label="Cari"
            className={`p-2 rounded-lg ${scrolled ? 'text-text-main' : 'text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <button
            className={`p-2 rounded-lg ${scrolled ? 'text-text-main' : 'text-white'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border-minimal shadow-xl animate-slide-up">
          <div className="container-narrow py-5 flex flex-col gap-1.5">
            {links.map(l => {
              const active = isActive(l.to)
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    active
                      ? 'text-brand-primary bg-brand-primary/10 font-bold'
                      : 'text-text-main hover:bg-canvas-light'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{l.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                </Link>
              )
            })}
            <div className="pt-4 border-t border-border-minimal flex flex-col gap-2.5">
              <Link
                to="/kontak"
                className="btn-primary w-full text-center text-sm py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                Mulai Proyek 🚀
              </Link>
              <Link
                to="/admin/login"
                className="w-full text-center text-xs font-semibold py-2 rounded-xl text-text-muted hover:text-text-main bg-canvas-light"
                onClick={() => setMobileOpen(false)}
              >
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
