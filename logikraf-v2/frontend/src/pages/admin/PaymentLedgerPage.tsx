import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../../lib/api'

interface LedgerRow {
  id: number
  order_id: string
  invoice_ref: string
  gross_amount: number
  provider_fee: number
  platform_fee: number
  net_amount: number
  status: string
  created_at: string
}

const rp = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function PaymentLedgerPage() {
  const [rows, setRows] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const d = await apiGet('/api/payment-transactions')
      setRows(Array.isArray(d) ? d : [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const refund = async (id: number) => {
    if (!confirm('Refund transaksi ini?')) return
    await apiPost(`/api/payment-transactions/${id}/refund`, {})
    load()
  }

  return (
    <div className="max-w-4xl mx-auto admin-page">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Payment Ledger</h1>
        <p className="text-text-muted text-sm mt-0.5">
          Pencatatan transaksi per tenant. Dana settlement langsung ke rekening tenant; Logikraf hanya mencatat fee & net.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-text-muted text-sm">Memuat...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-text-muted text-sm">Belum ada transaksi.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-text-muted">
              <tr>
                <th className="text-left font-medium px-4 py-3">Order</th>
                <th className="text-left font-medium px-4 py-3">Invoice</th>
                <th className="text-right font-medium px-4 py-3">Gross</th>
                <th className="text-right font-medium px-4 py-3">Provider Fee</th>
                <th className="text-right font-medium px-4 py-3">Platform Fee</th>
                <th className="text-right font-medium px-4 py-3">Net (Tenant)</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-minimal">
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs text-text-main">{r.order_id}</td>
                  <td className="px-4 py-3 text-text-muted">{r.invoice_ref}</td>
                  <td className="px-4 py-3 text-right text-text-main">{rp(r.gross_amount)}</td>
                  <td className="px-4 py-3 text-right text-text-muted">{rp(r.provider_fee)}</td>
                  <td className="px-4 py-3 text-right text-text-muted">{rp(r.platform_fee)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text-main">{rp(r.net_amount)}</td>
                  <td className="px-4 py-3 text-text-muted capitalize">{r.status}</td>
                  <td className="px-4 py-3">
                    {(r.status === 'settled' || r.status === 'paid') && (
                      <button
                        onClick={() => refund(r.id)}
                        className="text-status-danger hover:underline text-sm font-medium"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
