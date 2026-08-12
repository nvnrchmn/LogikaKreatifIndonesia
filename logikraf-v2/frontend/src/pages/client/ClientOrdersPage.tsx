import { Fragment, useEffect, useState } from 'react'

interface Order {
  id: number
  order_number: string
  project_name: string
  total_amount: number
  status: string
  milestone_status?: string
  created_at: string
}

const statusStyle: Record<string, string> = {
  pending: 'bg-status-warning/10 text-status-warning',
  active: 'bg-status-info/10 text-status-info',
  completed: 'bg-status-success/10 text-status-success',
  cancelled: 'bg-status-danger/10 text-status-danger',
}

const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
const StatusBadge = ({ s }: { s: string }) => (
  <span className={`badge ${statusStyle[s] || 'bg-gray-100 text-gray-600'}`}>{s || 'pending'}</span>
)

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then((d: Order[]) => {
      setOrders(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ponytail: no client endpoint yet, show all orders as demo; add /api/client/orders + filter by client_id when backend supports it
  const filtered = orders.filter(o =>
    (o.project_name || '').toLowerCase().includes(q.toLowerCase()) ||
    (o.order_number || '').toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-extrabold text-text-main">Orders</h1>
        <input
          className="form-input w-56"
          placeholder="Cari proyek / nomor..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-text-muted text-sm">Belum ada order.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-minimal">
                  <th className="text-left px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Nomor</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Proyek</th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Total</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <Fragment key={o.id}>
                    <tr
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      className="border-b border-border-minimal hover:bg-canvas-light transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3 font-medium text-text-main">{o.order_number || '-'}</td>
                      <td className="px-5 py-3 text-text-main">{o.project_name}</td>
                      <td className="px-5 py-3"><StatusBadge s={o.status} /></td>
                      <td className="px-5 py-3 text-right text-text-main">{fmt(o.total_amount)}</td>
                      <td className="px-5 py-3 text-right text-text-muted">{fmtDate(o.created_at)}</td>
                    </tr>
                    {expanded === o.id && (
                      <tr className="bg-canvas-overlay">
                        <td colSpan={5} className="px-5 py-4 text-sm text-text-muted">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div><p className="label">Milestone</p><p className="text-text-main">{o.milestone_status || '-'}</p></div>
                            <div><p className="label">Status</p><p className="text-text-main">{o.status || 'pending'}</p></div>
                            <div><p className="label">Total</p><p className="text-text-main">{fmt(o.total_amount)}</p></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
