import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', path: '/client/dashboard', icon: DashboardIcon },
  { label: 'Orders', path: '/client/orders', icon: ShoppingBagIcon },
  { label: 'Profil', path: '/client/profile', icon: PersonIcon },
]

function DashboardIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> }
function ShoppingBagIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> }
function PersonIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> }
function LogoutIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg> }
function OpenInNewIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0l3-3m0 0l3 3m-3-3v6" /></svg> }
function MenuIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg> }

export default function ClientLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    window.location.href = '/'
  }

  const pageTitle = location.pathname.replace('/client', '').replace('/', '') || 'Dashboard'

  return (
    <div className="min-h-screen bg-canvas-overlay">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className="hidden lg:flex flex-col w-60 bg-canvas-dark border-r border-white/10">
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10">
          <img src="/logo.png" alt="Logikraf" className="h-9 w-auto object-contain shrink-0" />
          <div>
            <div className="text-white font-display font-extrabold text-lg tracking-tight leading-tight">LOGIKRAF</div>
            <div className="text-text-light/50 text-[11px] font-medium">Client Portal</div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink key={item.label} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-text-light/60 hover:bg-white/5 hover:text-white'}`}>
                <span className="shrink-0"><Icon /></span>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-text-light/60 hover:bg-white/5 hover:text-white transition-colors">
            <span className="shrink-0"><LogoutIcon /></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-60 bg-canvas-dark border-r border-white/10 lg:hidden">
          <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10">
          <img src="/logo.png" alt="Logikraf" className="h-9 w-auto object-contain shrink-0" />
            <div>
              <div className="text-white font-display font-extrabold text-lg tracking-tight leading-tight">LOGIKRAF</div>
              <div className="text-text-light/50 text-[11px] font-medium">Client Portal</div>
            </div>
          </div>
          <nav className="py-3 px-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink key={item.label} to={item.path} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-text-light/60 hover:bg-white/5 hover:text-white'}`}>
                  <span className="shrink-0"><Icon /></span>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
          <div className="p-3 border-t border-white/10">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-text-light/60 hover:bg-white/5 hover:text-white transition-colors">
              <span className="shrink-0"><LogoutIcon /></span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <div className="lg:ml-60">
        <header className="sticky top-0 z-30 bg-white border-b border-border-minimal h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)} aria-label="Menu"><MenuIcon /></button>
            <h2 className="font-display font-bold text-text-main text-lg capitalize">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-gray-100 text-text-muted" title="Lihat Website"><OpenInNewIcon /></a>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-text-muted" title="Logout"><LogoutIcon /></button>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
