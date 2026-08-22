import { Link } from 'react-router-dom'
import { apiGet } from '../../lib/api'
import { useQueries } from '@tanstack/react-query'
import {
  AppstoreOutlined,
  FolderOpenOutlined,
  UsergroupAddOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  MessageOutlined
} from '@ant-design/icons'

type AnyArr = any[]

const get = (url: string) =>
  apiGet(url).then(r => (Array.isArray(r) ? r : [])).catch(() => [])

const len = (a: AnyArr) => (Array.isArray(a) ? a.length : 0)

interface Metric {
  key: string
  label: string
  value: number
  icon: React.ComponentType
  tone: string
  bgTone: string
  url: string
}

interface Activity {
  id: string | number
  type: 'lead' | 'order' | 'invoice'
  text: string
  sub: string
  time?: string
  url: string
}

export default function AdminDashboardPage() {
  const queries = useQueries({
    queries: [
      { queryKey: ['adminDash', 'packages'], queryFn: () => get('/api/packages') },
      { queryKey: ['adminDash', 'portfolios'], queryFn: () => get('/api/portfolios') },
      { queryKey: ['adminDash', 'leads'], queryFn: () => get('/api/leads') },
      { queryKey: ['adminDash', 'orders'], queryFn: () => get('/api/orders') },
      { queryKey: ['adminDash', 'invoices'], queryFn: () => get('/api/invoices') },
      { queryKey: ['adminDash', 'testimonials'], queryFn: () => get('/api/testimonials') },
      { queryKey: ['adminDash', 'finance'], queryFn: () => apiGet('/api/reports/finance').catch(() => null) },
      { queryKey: ['adminDash', 'gateways'], queryFn: () => get('/api/payment-gateways') },
    ]
  })

  const loading = queries.some(q => q.isLoading)
  const [pkgQ, portQ, leadsQ, ordQ, invQ, testQ, finQ, gwQ] = queries

  const metrics: Metric[] = [
    { key: 'packages', label: 'Paket', value: len(pkgQ.data), icon: AppstoreOutlined, tone: 'text-blue-600', bgTone: 'bg-blue-50 border-blue-100', url: '/admin/packages' },
    { key: 'portfolios', label: 'Portofolio', value: len(portQ.data), icon: FolderOpenOutlined, tone: 'text-purple-600', bgTone: 'bg-purple-50 border-purple-100', url: '/admin/portfolios' },
    { key: 'leads', label: 'Prospek Lead', value: len(leadsQ.data), icon: UsergroupAddOutlined, tone: 'text-amber-600', bgTone: 'bg-amber-50 border-amber-100', url: '/admin/leads' },
    { key: 'orders', label: 'Pesanan Aktif', value: len(ordQ.data), icon: ShoppingCartOutlined, tone: 'text-emerald-600', bgTone: 'bg-emerald-50 border-emerald-100', url: '/admin/orders' },
    { key: 'invoices', label: 'Tagihan Invoice', value: len(invQ.data), icon: FileTextOutlined, tone: 'text-rose-600', bgTone: 'bg-rose-50 border-rose-100', url: '/admin/invoices' },
    { key: 'testimonials', label: 'Testimoni', value: len(testQ.data), icon: MessageOutlined, tone: 'text-cyan-600', bgTone: 'bg-cyan-50 border-cyan-100', url: '/admin/testimonials' },
  ]

  const acts: Activity[] = []
  if (Array.isArray(leadsQ.data)) {
    leadsQ.data.slice(0, 3).forEach((l: any) => acts.push({
      id: `lead-${l.id}`, type: 'lead', text: `Prospek: ${l.name || l.email || 'Klien Baru'}`, sub: l.company ? `${l.company} • ${l.phone || '-'}` : l.status || 'Baru Masuk', url: '/admin/leads'
    }))
  }
  if (Array.isArray(ordQ.data)) {
    ordQ.data.slice(0, 3).forEach((o: any) => acts.push({
      id: `ord-${o.id}`, type: 'order', text: `Pesanan #${o.order_number || o.id}`, sub: `${o.project_name || 'Paket Digital'} • Rp ${Number(o.total_amount || 0).toLocaleString('id-ID')}`, url: '/admin/orders'
    }))
  }
  const activity = acts.slice(0, 6)
  const report = finQ.data as any
  const gateways = (Array.isArray(gwQ.data) ? gwQ.data : []) as any[]

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const maxMetric = Math.max(1, ...metrics.map(m => m.value))
  const totalRevenue = report?.total_revenue || 0

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Executive Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-canvas-dark via-gray-900 to-canvas-dark p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistem Operasional &amp; Gateway Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Dashboard Manajemen Logikraf
            </h1>
            <p className="text-xs sm:text-sm text-text-light/70 font-body">
              {today} • Pantau performa bisnis, konversi prospek leads, dan transaksi pembayaran digital QRIS secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/payment-hub"
              className="btn-primary text-xs py-2.5 px-4 shadow-lg shadow-brand-primary/25 active:scale-[0.98] transition-transform flex items-center gap-2"
            >
              <span>⚡ Buat Tagihan QRIS</span>
            </Link>
            <Link
              to="/admin/settings"
              className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>⚙️ Pengaturan API</span>
            </Link>
          </div>
        </div>

        {/* Quick Summary Chips */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-text-light/50 block mb-1">Total Revenue</span>
            <span className="font-display font-bold text-base text-emerald-400">
              Rp {Number(totalRevenue).toLocaleString('id-ID')}
            </span>
          </div>
          <div>
            <span className="text-text-light/50 block mb-1">Payment Gateway Aktif</span>
            <span className="font-display font-bold text-base text-white">
              {gateways.length} Gateway ({gateways.map(g => g.name).join(', ') || 'Belum diisi'})
            </span>
          </div>
          <div>
            <span className="text-text-light/50 block mb-1">Total Invoices</span>
            <span className="font-display font-bold text-base text-white">
              {report?.total_invoices || metrics.find(m => m.key === 'invoices')?.value || 0} Tagihan
            </span>
          </div>
          <div>
            <span className="text-text-light/50 block mb-1">Pending Orders</span>
            <span className="font-display font-bold text-base text-amber-400">
              {report?.pending_orders || 0} Menunggu Pembayaran
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-text-main">Metrik Data Utama</h2>
          <span className="text-xs text-text-muted">Klik kartu untuk membuka modul</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-border-minimal shadow-sm p-5 h-32 animate-pulse"
                />
              ))
            : metrics.map(m => {
                const Icon = m.icon
                return (
                  <Link
                    key={m.key}
                    to={m.url}
                    className="group bg-white rounded-3xl border border-border-minimal shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${m.bgTone} ${m.tone}`}>
                        <Icon />
                      </div>
                      <span className="text-text-muted group-hover:text-brand-primary transition-colors text-xs">→</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{m.label}</p>
                      <p className="text-2xl font-display font-black text-text-main">{m.value}</p>
                    </div>
                  </Link>
                )
              })}
        </div>
      </div>

      {/* Split Cards: Distribution & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume Distribution */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border-minimal pb-4">
            <div>
              <h2 className="font-display font-bold text-base text-text-main">Distribusi Volume Data</h2>
              <p className="text-xs text-text-muted mt-0.5">Proporsi konten dan entitas dalam database.</p>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-brand-primary hover:underline">
              Lihat Laporan Lengkap →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.map(m => {
                const pct = Math.max(8, Math.round((m.value / maxMetric) * 100))
                return (
                  <div key={m.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-main">{m.label}</span>
                      <span className="font-mono font-semibold text-text-muted">{m.value} data</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-canvas-light overflow-hidden p-0.5 border border-border-minimal">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-brand-primary to-blue-500 transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Recent Activity Stream */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-minimal pb-4 mb-4">
              <div>
                <h2 className="font-display font-bold text-base text-text-main">Aktivitas Terbaru</h2>
                <p className="text-xs text-text-muted mt-0.5">Entri prospek lead dan transaksi teranyar.</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                Belum ada rekaman aktivitas baru.
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map(a => (
                  <Link
                    key={a.id}
                    to={a.url}
                    className="group block p-3 rounded-2xl bg-canvas-light border border-border-minimal hover:border-brand-primary/40 hover:bg-white transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              a.type === 'lead' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <h4 className="text-xs font-bold text-text-main group-hover:text-brand-primary transition-colors">
                            {a.text}
                          </h4>
                        </div>
                        <p className="text-[11px] text-text-muted pl-3.5 line-clamp-1">{a.sub}</p>
                      </div>
                      <span className="text-xs font-bold text-text-muted group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border-minimal">
            <Link
              to="/admin/payment-ledger"
              className="w-full inline-flex items-center justify-center gap-2 bg-canvas-overlay hover:bg-canvas-light text-text-main font-bold text-xs py-2.5 px-4 rounded-2xl border border-border-minimal transition-all"
            >
              <span>📊 Buka Pembukuan Payment Ledger</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
