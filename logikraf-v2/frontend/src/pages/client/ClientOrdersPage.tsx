import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/client/orders', { headers: auth() })
      .then(r => (r.ok ? r.json() : []))
      .then((d: Order[]) => {
        setOrders(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = orders.filter(
    o =>
      (o.project_name || '').toLowerCase().includes(q.toLowerCase()) ||
      (o.order_number || '').toLowerCase().includes(q.toLowerCase())
  )

  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
  const fmtDate = (s: string) =>
    s
      ? new Date(s).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-'

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-text-main">Pesanan &amp; Layanan Saya</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Pantau status pengerjaan proyek, rincian milestone, dan status invoice pembayaran Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              className="form-input text-xs pl-8 pr-4 py-2 w-full sm:w-60"
              placeholder="Cari proyek / nomor..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
          </div>
          <Link to="/paket" className="btn-primary text-xs py-2 px-4 shadow-sm whitespace-nowrap">
            + Pesan Baru
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-main font-bold mb-1">
              {q ? 'Tidak ada pesanan yang sesuai dengan pencarian.' : 'Belum ada pesanan terdaftar.'}
            </p>
            <p className="text-text-muted text-xs mb-4">
              {q ? 'Coba periksa kembali kata kunci Anda.' : 'Pilih paket website atau ajukan konsultasi kustom.'}
            </p>
            <Link to="/paket" className="btn-primary text-xs py-2 px-4 shadow-sm">
              Lihat Pilihan Paket 🚀
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border-minimal bg-canvas-overlay/60">
                  <th className="text-left font-bold text-text-main py-3.5 px-6">Nomor Referensi</th>
                  <th className="text-left font-bold text-text-main py-3.5 px-6">Nama Proyek</th>
                  <th className="text-left font-bold text-text-main py-3.5 px-6">Status</th>
                  <th className="text-right font-bold text-text-main py-3.5 px-6">Total Biaya</th>
                  <th className="text-right font-bold text-text-main py-3.5 px-6">Tanggal Pesan</th>
                  <th className="text-center font-bold text-text-main py-3.5 px-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-minimal">
                {filtered.map(o => {
                  const isExp = expanded === o.id
                  const st = String(o.status || 'pending').toLowerCase()
                  const statusBadge: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    active: 'bg-blue-50 text-blue-700 border-blue-200',
                    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                  }

                  return (
                    <Fragment key={o.id}>
                      <tr
                        onClick={() => setExpanded(isExp ? null : o.id)}
                        className={`hover:bg-canvas-light/60 transition-colors cursor-pointer ${
                          isExp ? 'bg-canvas-light/40' : ''
                        }`}
                      >
                        <td className="py-4 px-6 font-mono font-bold text-text-main">
                          {o.order_number || `#${o.id}`}
                        </td>
                        <td className="py-4 px-6 font-bold text-text-main">{o.project_name}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                              statusBadge[st] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {o.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-700">
                          {fmt(o.total_amount)}
                        </td>
                        <td className="py-4 px-6 text-right text-text-muted font-mono text-xs">
                          {fmtDate(o.created_at)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-brand-primary font-bold text-xs">
                            {isExp ? '▲ Tutup' : '▼ Rincian'}
                          </span>
                        </td>
                      </tr>

                      {isExp && (
                        <tr className="bg-canvas-overlay/70">
                          <td colSpan={6} className="p-6">
                            <div className="bg-white rounded-2xl border border-border-minimal p-5 space-y-4">
                              <div className="flex items-center justify-between border-b border-border-minimal pb-3">
                                <h4 className="font-display font-bold text-sm text-text-main">
                                  Rincian Milestone &amp; Status Pengerjaan
                                </h4>
                                <span className="text-xs text-text-muted font-mono">
                                  Ref: {o.order_number || `#${o.id}`}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-text-muted block mb-1">Tahap Pengerjaan</span>
                                  <span className="font-bold text-text-main">
                                    {o.milestone_status || 'Tahap Persiapan / Analisa Kebutuhan'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-text-muted block mb-1">Status Pembayaran</span>
                                  <span className="font-bold text-text-main capitalize">
                                    {o.status === 'completed'
                                      ? 'Lunas Penuh'
                                      : o.status === 'active'
                                      ? 'Termin Berjalan'
                                      : 'Menunggu Konfirmasi QRIS'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-text-muted block mb-1">Total Tagihan</span>
                                  <span className="font-mono font-bold text-emerald-700 text-sm">
                                    {fmt(o.total_amount)}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-border-minimal flex flex-wrap items-center justify-between gap-3">
                                <span className="text-[11px] text-text-muted">
                                  💡 Jika ada perubahan spesifikasi teknis, hubungi Project Manager Anda.
                                </span>
                                <a
                                  href={`https://wa.me/628983342429?text=Halo%20Logikraf,%20saya%20ingin%20menanyakan%20progres%20order%20${encodeURIComponent(
                                    o.order_number || String(o.id)
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-secondary text-xs py-1.5 px-3"
                                >
                                  💬 Tanya Tim Pengembang
                                </a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
