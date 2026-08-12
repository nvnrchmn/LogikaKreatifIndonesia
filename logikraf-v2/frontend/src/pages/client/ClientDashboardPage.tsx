import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

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
const StatusBadge = ({ s }: { s: string }) => (
  <span className={`badge ${statusStyle[s] || 'bg-gray-100 text-gray-600'}`}>{s || 'pending'}</span>
)

export default function ClientDashboardPage() {
  const { name } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then((d: Order[]) => {
      setOrders(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const total = orders.length
  const active = orders.filter(o => o.status === 'active').length
  const completed = orders.filter(o => o.status === 'completed').length
  const recent = orders.slice(0, 5)

  const stats = [
    { label: 'Total Order', value: total, icon: BagIcon },
    { label: 'Order Aktif', value: active, icon: PulseIcon },
    { label: 'Selesai', value: completed, icon: CheckIcon },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-extrabold text-text-main">Halo, {name || 'Client'} 👋</h1>
        <p className="text-text-muted text-sm mt-1">Berikut ringkasan proyek Anda di LOGIKRAF.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center"><Icon /></div>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-display font-extrabold text-text-main">{s.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border-minimal flex items-center justify-between">
          <h2 className="font-display font-bold text-text-main">Order Terbaru</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : recent.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id} className="border-b border-border-minimal last:border-0 hover:bg-canvas-light transition-colors">
                    <td className="px-5 py-3 font-medium text-text-main">{o.order_number || '-'}</td>
                    <td className="px-5 py-3 text-text-main">{o.project_name}</td>
                    <td className="px-5 py-3"><StatusBadge s={o.status} /></td>
                    <td className="px-5 py-3 text-right text-text-main">{fmt(o.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function BagIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> }
function PulseIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> }
function CheckIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
