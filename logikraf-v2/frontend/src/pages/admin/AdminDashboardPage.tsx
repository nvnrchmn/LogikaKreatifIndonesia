import { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

type AnyArr = any[]

const get = (url: string) =>
  apiGet(url).then(r => (Array.isArray(r) ? r : [])).catch(() => [])

const len = (a: AnyArr) => (Array.isArray(a) ? a.length : 0)

interface Metric { key: string; label: string; value: number; icon: React.ComponentType; tone: string }
interface Activity { icon: React.ComponentType; text: string; sub: string }

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      get('/api/services'),
      get('/api/portfolios'),
      get('/api/leads'),
      get('/api/orders'),
      get('/api/invoices'),
      get('/api/testimonials'),
    ]).then(([services, portfolios, leads, orders, invoices, testimonials]) => {
      setMetrics([
        { key: 'services', label: 'Services', value: len(services), icon: ServicesIcon, tone: 'bg-brand-primary/10 text-brand-primary' },
        { key: 'portfolios', label: 'Portfolios', value: len(portfolios), icon: PortfoliosIcon, tone: 'bg-brand-accent/10 text-brand-accent' },
        { key: 'leads', label: 'Leads', value: len(leads), icon: LeadsIcon, tone: 'bg-status-warning/10 text-status-warning' },
        { key: 'orders', label: 'Orders', value: len(orders), icon: OrdersIcon, tone: 'bg-status-info/10 text-status-info' },
        { key: 'invoices', label: 'Invoices', value: len(invoices), icon: InvoiceIcon, tone: 'bg-status-danger/10 text-status-danger' },
        { key: 'testimonials', label: 'Testimonials', value: len(testimonials), icon: TestimonialsIcon, tone: 'bg-brand-primary/10 text-brand-primary' },
      ])
      const acts: Activity[] = []
      ;(Array.isArray(leads) ? leads : []).slice(0, 4).forEach((l: any) =>
        acts.push({ icon: LeadsIcon, text: `Lead baru: ${l.name || l.email || '—'}`, sub: l.status || 'Baru' }))
      ;(Array.isArray(orders) ? orders : []).slice(0, 4).forEach((o: any) =>
        acts.push({ icon: OrdersIcon, text: `Order #${o.id ?? o.order_id ?? '—'}`, sub: o.status || '—' }))
      setActivity(acts.slice(0, 6))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const max = Math.max(1, ...metrics.map(m => m.value))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Selamat datang, Admin</h1>
        <p className="text-text-muted text-sm mt-0.5">{today}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-5 h-[88px] animate-pulse" />)
          : metrics.map(m => {
            const Icon = m.icon
            return (
              <div key={m.key} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${m.tone}`}>
                  <Icon />
                </div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{m.label}</p>
                <p className="text-2xl font-display font-extrabold text-text-main">{m.value}</p>
              </div>
            )
          })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border-minimal shadow-sm p-5">
          <h2 className="font-display font-bold text-text-main mb-4">Ringkasan Data</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.map(m => (
                <div key={m.key} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-text-muted">{m.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-canvas-light overflow-hidden">
                    <div className="h-full rounded-full bg-brand-primary transition-all" style={{ width: `${(m.value / max) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-text-main">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-5">
          <h2 className="font-display font-bold text-text-main mb-4">Aktivitas Terbaru</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-text-muted">Belum ada aktivitas.</p>
          ) : (
            <ul className="space-y-1">
              {activity.map((a, i) => {
                const Icon = a.icon
                return (
                  <li key={i} className="flex items-start gap-3 py-2">
                    <span className="w-8 h-8 rounded-lg bg-canvas-light text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Icon />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-text-main truncate">{a.text}</p>
                      <p className="text-xs text-text-muted">{a.sub}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function ServicesIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg> }
function PortfoliosIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-2.794 0-5.3-.632-7.274-1.746m0 0A23.987 23.987 0 013 12.255M15 21h-2m-2 0h10M12 17v4m-7.5-3.5l-1.5-1.5m15 1.5l1.5-1.5" /></svg> }
function LeadsIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19.128a9.38 9.38 0 002.5.5 9.38 9.38 0 002.5-.5M15 19.128a9.001 9.001 0 01-8.998-9.372A6.002 6.002 0 0119.5 10.5a5.976 5.976 0 01-2.498 4.498M15 19.128V15a3 3 0 00-3-3v0a3 3 0 00-3 3v4.128M9.75 4.5h4.5a2.25 2.25 0 012.25 2.25v.75h.75a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25h-.75v.75a2.25 2.25 0 01-2.25 2.25h-4.5A2.25 2.25 0 016.75 15v-.75h-.75a2.25 2.25 0 01-2.25-2.25v-3A2.25 2.25 0 016.75 6.75h.75v-.75A2.25 2.25 0 019.75 4.5z" /></svg> }
function OrdersIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg> }
function InvoiceIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg> }
function TestimonialsIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> }
