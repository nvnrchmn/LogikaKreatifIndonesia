import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../lib/api'

interface Order {
  id: number
  order_number: string
  project_name: string
  total_amount: number
  status: string
  milestone_status?: string
  created_at: string
}

export default function ClientDashboardPage() {
  const { name } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/orders', { headers: auth() })
      .then(r => (r.ok ? r.json() : []))
      .then((d: Order[]) => {
        setOrders(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const total = orders.length
  const active = orders.filter(o => o.status === 'active').length
  const pending = orders.filter(o => o.status === 'pending').length
  const completed = orders.filter(o => o.status === 'completed').length
  const recent = orders.slice(0, 5)

  const stats = [
    {
      label: 'Total Proyek',
      value: total,
      icon: BagIcon,
      tone: 'text-blue-600',
      bgTone: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'Sedang Berjalan',
      value: active,
      icon: PulseIcon,
      tone: 'text-amber-600',
      bgTone: 'bg-amber-50 border-amber-100',
    },
    {
      label: 'Menunggu Bayar',
      value: pending,
      icon: PendingIcon,
      tone: 'text-rose-600',
      bgTone: 'bg-rose-50 border-rose-100',
    },
    {
      label: 'Selesai & Rilis',
      value: completed,
      icon: CheckIcon,
      tone: 'text-emerald-600',
      bgTone: 'bg-emerald-50 border-emerald-100',
    },
  ]

  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
  const fmtDate = (s: string) =>
    s
      ? new Date(s).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '-'

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-canvas-dark via-gray-900 to-canvas-dark p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-accent text-xs font-semibold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span>Portal Klien Terverifikasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Selamat Datang, {name || 'Klien Logikraf'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-text-light/70 font-body max-w-xl">
              Pantau progres pengerjaan software, milestone termin, serta invoice pembayaran proyek Anda di Logikraf.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/paket"
              className="btn-primary text-xs py-2.5 px-4 shadow-lg shadow-brand-primary/25 active:scale-[0.98] transition-transform"
            >
              + Pesan Proyek Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="bg-white rounded-3xl border border-border-minimal shadow-sm p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${s.bgTone} ${s.tone}`}
                >
                  <Icon />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                  {s.label}
                </p>
                <p className="text-2xl font-display font-black text-text-main">
                  {loading ? '...' : s.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders Card */}
      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border-minimal flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-text-main">Pesanan &amp; Proyek Terbaru</h2>
            <p className="text-xs text-text-muted mt-0.5">Daftar layanan yang sedang atau telah dikerjakan.</p>
          </div>
          <Link to="/client/orders" className="text-xs font-bold text-brand-primary hover:underline">
            Lihat Semua Pesanan →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-main font-bold mb-1">Belum Ada Riwayat Pesanan</p>
            <p className="text-text-muted text-xs mb-4">Mulai kolaborasi digital Anda dengan memesan paket layanan.</p>
            <Link to="/paket" className="btn-primary text-xs py-2 px-4 shadow-sm">
              Lihat Katalog Paket Website UMKM
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border-minimal bg-canvas-overlay/60">
                  <th className="text-left font-bold text-text-main py-3.5 px-6">No. Order</th>
                  <th className="text-left font-bold text-text-main py-3.5 px-6">Nama Proyek</th>
                  <th className="text-left font-bold text-text-main py-3.5 px-6">Status Pengerjaan</th>
                  <th className="text-right font-bold text-text-main py-3.5 px-6">Total Nominal</th>
                  <th className="text-right font-bold text-text-main py-3.5 px-6">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-minimal">
                {recent.map(o => {
                  const st = String(o.status || 'pending').toLowerCase()
                  const statusBadge: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    active: 'bg-blue-50 text-blue-700 border-blue-200',
                    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                  }
                  return (
                    <tr key={o.id} className="hover:bg-canvas-light/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-text-main">
                        {o.order_number || `#${o.id}`}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-text-main">{o.project_name}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                            statusBadge[st] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {o.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-700">
                        {fmt(o.total_amount)}
                      </td>
                      <td className="py-3.5 px-6 text-right text-text-muted font-mono text-xs">
                        {fmtDate(o.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Support Box */}
      <div className="bg-canvas-overlay rounded-3xl border border-border-minimal p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-text-main">Butuh Bantuan Teknis atau Penambahan Fitur?</h3>
          <p className="text-xs text-text-muted mt-1">Konsultasikan langsung dengan tim engineer Logikraf via WhatsApp resmi.</p>
        </div>
        <a
          href="https://wa.me/628983342429"
          target="_blank"
          rel="noreferrer"
          className="btn-primary text-xs py-2.5 px-5 shadow-sm whitespace-nowrap"
        >
          💬 Chat WhatsApp Support
        </a>
      </div>
    </div>
  )
}

function BagIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function PendingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
