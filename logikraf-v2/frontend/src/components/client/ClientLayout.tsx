import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', path: '/client/dashboard', icon: DashboardIcon },
  { label: 'Pesanan Saya', path: '/client/orders', icon: ShoppingBagIcon },
  { label: 'Profil Akun', path: '/client/profile', icon: PersonIcon },
]

export default function ClientLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    window.location.href = '/'
  }

  const clientName = localStorage.getItem('name') || 'Klien Logikraf'
  const clientEmail = localStorage.getItem('email') || 'klien@logikraf.id'

  return (
    <div className="min-h-screen bg-canvas-light text-text-main flex flex-col">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-canvas-dark border-r border-white/10 h-screen fixed inset-y-0 left-0 z-30 justify-between">
        <div>
          {/* Logo Brand */}
          <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
            <img src="/logo.png" alt="Logikraf" className="h-9 w-auto object-contain shrink-0" />
            <div>
              <div className="text-white font-display font-extrabold text-lg tracking-tight leading-tight">LOGIKRAF</div>
              <div className="text-brand-accent text-[11px] font-bold uppercase tracking-wider">Client Portal</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="py-6 px-3 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                        : 'text-text-light/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <span className="shrink-0"><Icon /></span>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/20 text-brand-accent flex items-center justify-center font-bold text-xs shrink-0 border border-brand-primary/30">
              {clientName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{clientName}</p>
              <p className="text-[11px] text-text-light/50 font-mono truncate">{clientEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
          >
            <LogoutIcon />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-canvas-dark border-r border-white/10 lg:hidden flex flex-col justify-between">
          <div>
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logikraf" className="h-9 w-auto object-contain shrink-0" />
                <div>
                  <div className="text-white font-display font-extrabold text-lg tracking-tight leading-tight">LOGIKRAF</div>
                  <div className="text-brand-accent text-[11px] font-bold uppercase tracking-wider">Client Portal</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-text-light/60 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <nav className="py-6 px-3 space-y-1.5">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                          : 'text-text-light/70 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="shrink-0"><Icon /></span>
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
            >
              <LogoutIcon />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-screen lg:pl-64 flex flex-col flex-1">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border-minimal h-18 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-canvas-overlay text-text-main"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted">Portal Klien</span>
              <span className="text-text-muted">/</span>
              <span className="text-sm font-bold text-text-main capitalize">
                {location.pathname.replace('/client/', '').replace('orders', 'Pesanan Saya').replace('profile', 'Profil').replace('dashboard', 'Ringkasan')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas-overlay hover:bg-canvas-light text-xs font-semibold text-text-main border border-border-minimal transition-colors"
            >
              <span>🌐 Buka Website</span>
              <OpenInNewIcon />
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors"
            >
              <span>💬 Helpdesk</span>
            </a>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ShoppingBagIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
}

function OpenInNewIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0l3-3m0 0l3 3m-3-3v6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
