import { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

interface Recon {
  tenant: string
  count: number
  gross_amount: number
  provider_fee: number
  platform_fee: number
  net_amount: number
  by_status: Record<string, number>
}

const rp = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function ReconciliationPage() {
  const [data, setData] = useState<Recon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/api/payment-reconciliation')
      .then(d => setData(d as Recon))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Rekonsiliasi</h1>
        <p className="text-text-muted text-sm mt-0.5">
          Ringkasan settlement per tenant dari ledger. Dana net hak tenant; Logikraf hanya mencatat fee.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6 space-y-4">
        {loading ? (
          <div className="text-text-muted text-sm">Memuat...</div>
        ) : !data ? (
          <div className="text-text-muted text-sm">Gagal memuat.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="Total Transaksi" value={String(data.count)} />
              <Stat label="Gross" value={rp(data.gross_amount)} />
              <Stat label="Provider Fee" value={rp(data.provider_fee)} />
              <Stat label="Platform Fee" value={rp(data.platform_fee)} />
              <Stat label="Net (Tenant)" value={rp(data.net_amount)} highlight />
            </div>
            <div className="pt-4 border-t border-border-minimal">
              <p className="text-xs text-text-muted mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.by_status).map(([k, v]) => (
                  <span key={k} className="px-3 py-1 rounded-full bg-bg-soft text-text-main text-xs capitalize">
                    {k}: {v}
                  </span>
                ))}
                {Object.keys(data.by_status).length === 0 && (
                  <span className="text-text-muted text-xs">—</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-status-success' : 'text-text-main'}`}>{value}</p>
    </div>
  )
}
