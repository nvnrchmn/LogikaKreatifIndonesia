import { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

interface Account {
  id: number
  tenant_id: string
  provider: string
  merchant_id: string
  merchant_reference: string
  status: string
  settlement_status: string
}

const statusColor: Record<string, string> = {
  ACTIVE: 'text-status-success',
  SUSPENDED: 'text-status-danger',
  ONBOARDING: 'text-status-warning',
  UNDER_REVIEW: 'text-status-warning',
  PAYMENT_NOT_CONFIGURED: 'text-text-muted',
}

export default function TenantPaymentAccountsPage() {
  const [items, setItems] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/api/tenant-payment-accounts')
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto admin-page">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-text-main">Merchant Account</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Status onboarding merchant tiap provider. Dana settlement langsung ke rekening tenant, Logikraf tidak menampung dana.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6">
          {loading ? (
            <div className="text-text-muted text-sm">Memuat...</div>
          ) : items.length === 0 ? (
            <div className="text-text-muted text-sm">Belum ada merchant account. Isi Server Key di Pengaturan untuk mengaktifkan.</div>
          ) : (
            <div className="divide-y divide-border-minimal">
              {items.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-text-main text-sm capitalize">{a.provider}</p>
                    <p className="text-xs text-text-muted">
                      {a.merchant_id ? `MID: ${a.merchant_id}` : 'Server key belum diisi'}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${statusColor[a.status] || 'text-text-muted'}`}>{a.status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}
