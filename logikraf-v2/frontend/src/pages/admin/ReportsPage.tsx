import { useState, useEffect } from 'react'

interface FinanceReport {
  total_revenue?: number
  total_orders?: number
  pending_orders?: number
  total_invoices?: number
  by_month?: { month: string; revenue: number; orders: number }[]
}

const statMeta = [
  { key: 'total_revenue', label: 'Total Revenue', money: true, icon: RevenueIcon, tone: 'bg-brand-primary/10 text-brand-primary' },
  { key: 'total_orders', label: 'Total Orders', money: false, icon: OrdersIcon, tone: 'bg-status-info/10 text-status-info' },
  { key: 'pending_orders', label: 'Pending Orders', money: false, icon: PendingIcon, tone: 'bg-status-warning/10 text-status-warning' },
  { key: 'total_invoices', label: 'Total Invoices', money: false, icon: InvoiceIcon, tone: 'bg-status-danger/10 text-status-danger' },
] as const

export default function AdminReportsPage() {
  const [data, setData] = useState<FinanceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/reports/finance', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setError('Gagal memuat laporan'))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
  const months = data?.by_month ?? []
  const maxRev = Math.max(1, ...months.map(m => Number(m.revenue) || 0))

  return (
    <div className="max-w-6xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <a href="/admin" className="hover:text-brand-primary">Admin</a>
        <span>/</span>
        <span className="text-text-main">Reports</span>
      </nav>

      <h1 className="text-2xl font-display font-extrabold text-text-main mb-6">Finance Reports</h1>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statMeta.map(s => {
          const Icon = s.icon
          const value = (data as any)?.[s.key]
          return (
            <div key={s.key} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.tone}`}>
                <Icon />
              </div>
              <div className="text-text-muted text-xs uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-2xl font-display font-extrabold text-text-main">
                {loading ? <span className="inline-block w-20 h-6 bg-gray-100 rounded animate-pulse align-middle" /> :
                  (s.money ? fmt(value || 0) : (value ?? 0))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-minimal">
          <h2 className="font-display font-bold text-text-main">By Month</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-minimal">
                <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Bulan</th>
                <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Revenue</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-minimal">
                    <td className="px-4 py-3"><div className="w-24 h-4 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="w-20 h-4 bg-gray-100 rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="w-12 h-4 bg-gray-100 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : months.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-text-muted">Belum ada data.</td></tr>
              ) : (
                months.map(m => (
                  <tr key={m.month} className="border-b border-border-minimal hover:bg-canvas-light transition-colors">
                    <td className="px-4 py-3 text-text-main font-medium">{m.month}</td>
                    <td className="px-4 py-3 text-text-main">
                      <div className="flex items-center gap-3">
                        <span className="w-28 shrink-0">{fmt(m.revenue)}</span>
                        <div className="flex-1 h-2 rounded-full bg-canvas-light overflow-hidden min-w-[80px]">
                          <div className="h-full rounded-full bg-brand-primary" style={{ width: `${(Number(m.revenue) / maxRev) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-text-main">{m.orders}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RevenueIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function OrdersIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg> }
function PendingIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function InvoiceIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg> }
