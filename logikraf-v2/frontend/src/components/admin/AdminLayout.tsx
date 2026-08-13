import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

// Grouped nav — Nielsen #6 (recognition over recall): scannable sections beat a flat 19-item list.
const navSections = [
  {
    title: 'Utama',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
    ],
  },
  {
    title: 'Konten',
    items: [
      { label: 'Services', path: '/admin/services', icon: ExtensionIcon },
      { label: 'Portfolios', path: '/admin/portfolios', icon: WorkIcon },
      { label: 'Packages', path: '/admin/packages', icon: ShoppingBagIcon },
      { label: 'Blog', path: '/admin/blog', icon: ArticleIcon },
      { label: 'Testimonials', path: '/admin/testimonials', icon: RateReviewIcon },
    ],
  },
  {
    title: 'Relasi',
    items: [
      { label: 'Clients', path: '/admin/clients', icon: PeopleIcon },
      { label: 'Leads', path: '/admin/leads', icon: FolderIcon },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Orders', path: '/admin/orders', icon: ReceiptIcon },
      { label: 'Invoices', path: '/admin/invoices', icon: ReceiptIcon },
      { label: 'Transactions', path: '/admin/transactions', icon: ReceiptIcon },
      { label: 'Payment Hub', path: '/admin/payment-hub', icon: ReceiptIcon },
      { label: 'Merchant Accounts', path: '/admin/merchant-accounts', icon: ReceiptIcon },
      { label: 'Payment Ledger', path: '/admin/payment-ledger', icon: ReceiptIcon },
      { label: 'Rekonsiliasi', path: '/admin/reconciliation', icon: ReceiptIcon },
    ],
  },
  {
    title: 'Operasional',
    items: [
      { label: 'Reports', path: '/admin/reports', icon: ChartIcon },
      { label: 'Tickets', path: '/admin/tickets', icon: HelpIcon },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { label: 'Settings', path: '/admin/settings', icon: SettingsIcon },
    ],
  },
]

function DashboardIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> }
function ExtensionIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg> }
function ShoppingBagIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> }
function ChartIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6m4 6V9m4 10V5" /></svg> }
function WorkIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-2.794 0-5.3-.632-7.274-1.746m0 0A23.987 23.987 0 013 12.255M15 21h-2m-2 0h10M12 17v4m-7.5-3.5l-1.5-1.5m15 1.5l1.5-1.5" /></svg> }
function ArticleIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2h-2z" /></svg> }
function RateReviewIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> }
function PeopleIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> }
function FolderIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v14a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> }
function ReceiptIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 3h20v14a2 2 0 01-2 2H4a2 2 0 01-2-2V3z" /></svg> }
function HelpIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function SettingsIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
function MenuIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg> }
function LogoutIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg> }
function SearchIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg> }
function ChevronDownIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" /></svg> }
function OpenInNewIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0l3-3m0 0l3 3m-3-3v6" /></svg> }

const adminName = localStorage.getItem('name') || 'Admin'
const adminEmail = localStorage.getItem('email') || 'admin@logikraf.id'

function SidebarContent({ sidebarOpen, collapsed, toggleSection, query, onNavigate }: {
  sidebarOpen: boolean
  collapsed: Record<string, boolean>
  toggleSection: (t: string) => void
  query: string
  onNavigate: () => void
}) {
  const q = query.trim().toLowerCase()
  return (
    <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-2">
      {navSections.map(section => {
        const items = q ? section.items.filter(i => i.label.toLowerCase().includes(q)) : section.items
        if (q && items.length === 0) return null
        const isCollapsed = collapsed[section.title]
        return (
          <div key={section.title}>
            {sidebarOpen && (
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-light/40 hover:text-text-light/70 transition-colors"
              >
                <span>{section.title}</span>
                <svg className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 9l6 6 6-6" /></svg>
              </button>
            )}
            {(!isCollapsed || !sidebarOpen) && (
              <div className="space-y-1">
                {items.map(item => {
                  const Icon = item.icon
                  return (
                    <NavLink key={item.label} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${isActive ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-text-light/70 hover:bg-white/5 hover:text-white'}`} title={!sidebarOpen ? item.label : undefined} onClick={onNavigate}>
                      <span className="shrink-0"><Icon /></span>
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')
  const location = useLocation()

  const toggleSection = (t: string) => setCollapsed(c => ({ ...c, [t]: !c[t] }))
  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('name'); localStorage.removeItem('email')
    window.location.href = '/admin/login'
  }

  const allItems = navSections.flatMap(s => s.items)
  const activeNav = allItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
  const pageTitle = activeNav?.label ?? 'Admin'

  return (
    <div className="min-h-screen bg-canvas-overlay">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex flex-col bg-canvas-dark border-r border-white/10 transition-all duration-200 ${sidebarOpen ? 'w-64' : 'w-16'} h-screen sticky top-0`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 shrink-0">
          <img src="/logo.png" alt="Logikraf" className="h-8 w-auto object-contain shrink-0" />
          {sidebarOpen && <span className="text-white font-display font-extrabold text-base tracking-tight">LOGIKRAF</span>}
        </div>
        <SidebarContent sidebarOpen={sidebarOpen} collapsed={collapsed} toggleSection={toggleSection} query={query} onNavigate={() => {}} />
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold shrink-0">A</div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="text-white text-sm font-semibold leading-tight truncate">{adminName}</div>
                <div className="text-text-light/50 text-xs leading-tight truncate">{adminEmail}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-canvas-dark border-r border-white/10 lg:hidden h-screen flex flex-col">
          <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 shrink-0">
            <img src="/logo.png" alt="Logikraf" className="h-8 w-auto object-contain shrink-0" />
            <span className="text-white font-display font-extrabold text-base tracking-tight">LOGIKRAF</span>
          </div>
          <SidebarContent sidebarOpen query={query} collapsed={collapsed} toggleSection={toggleSection} onNavigate={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <header className="sticky top-0 z-30 bg-white border-b border-border-minimal h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)} aria-label="Menu"><MenuIcon /></button>
            <button className="hidden lg:flex p-2 -ml-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar"><MenuIcon /></button>
            <div>
              <h2 className="font-display font-bold text-text-main text-base leading-tight capitalize">{pageTitle}</h2>
              <p className="text-[11px] text-text-muted leading-tight">Logikraf Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live nav filter — Nielsen #6 recognition: find any module fast */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-canvas-light border border-border-minimal focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all">
              <span className="text-text-muted"><SearchIcon /></span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari modul..."
                className="bg-transparent text-sm text-text-main placeholder:text-text-muted/60 outline-none w-40"
                aria-label="Cari modul"
              />
            </div>
            <a href="/" target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-gray-100 text-text-muted" title="Lihat Website"><OpenInNewIcon /></a>

            {/* User dropdown — Nielsen #1: always show who is logged in */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">A</div>
                <span className="hidden sm:block text-sm font-semibold text-text-main">{adminName}</span>
                <ChevronDownIcon />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 z-40 bg-white rounded-xl border border-border-minimal shadow-lg p-2" role="menu">
                    <div className="px-3 py-2 border-b border-border-minimal">
                      <p className="text-sm font-semibold text-text-main truncate">{adminName}</p>
                      <p className="text-xs text-text-muted truncate">{adminEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm font-medium text-status-danger hover:bg-status-danger/10 transition-colors"
                      role="menuitem"
                    >
                      <LogoutIcon /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
