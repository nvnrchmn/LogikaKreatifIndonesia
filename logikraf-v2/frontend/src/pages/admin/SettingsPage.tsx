import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../lib/api'

const companyFields = [
  { key: 'company_name', label: 'Nama Perusahaan' },
  { key: 'company_email', label: 'Email' },
  { key: 'company_phone', label: 'Telepon' },
  { key: 'company_address', label: 'Alamat' },
]

const gatewayDefs = [
  {
    id: 'midtrans', name: 'Midtrans', color: 'bg-indigo-500',
    keys: [
      { key: 'midtrans_server_key', label: 'Server Key' },
      { key: 'midtrans_client_key', label: 'Client Key' },
      { key: 'midtrans_env', label: 'Environment', type: 'select', options: ['sandbox', 'production'] },
      { key: 'midtrans_fee_percent', label: 'Fee Midtrans (%)', type: 'number' },
      { key: 'midtrans_fee_flat', label: 'Fee Flat Midtrans (Rp)', type: 'number' },
      { key: 'platform_fee_percent', label: 'Fee Platform Logikraf (%)', type: 'number' },
    ],
  },
  {
    id: 'xendit', name: 'Xendit', color: 'bg-yellow-500',
    keys: [
      { key: 'xendit_secret_key', label: 'Secret Key' },
      { key: 'xendit_public_key', label: 'Public Key' },
      { key: 'xendit_webhook_token', label: 'Webhook Token' },
      { key: 'xendit_fee_percent', label: 'Fee Xendit (%)', type: 'number' },
      { key: 'xendit_fee_flat', label: 'Fee Flat Xendit (Rp)', type: 'number' },
    ],
  },
]

export default function AdminSettingsPage() {
  const [items, setItems] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [editKey, setEditKey] = useState<string | null>(null)
  const [form, setForm] = useState({ key: '', value: '', label: '' })

  const [gateways, setGateways] = useState<string[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiGet('/api/settings')
      setItems(data as Record<string, string>)
    } catch {
      // noop
    } finally {
      setLoading(false)
    }
    try {
      const g = await apiGet('/api/payment-gateways')
      setGateways(Array.isArray(g) ? g.map((x: any) => x.id) : [])
    } catch {
      // noop
    }
  }

  useEffect(() => { load() }, [])

  const toggleGateway = async (id: string, on: boolean) => {
    const next = on ? [...gateways, id] : gateways.filter(g => g !== id)
    setGateways(next)
    await apiPut(`/api/settings/${encodeURIComponent('payment_gateways')}`, { value: JSON.stringify(next) })
  }

  const saveKey = async (key: string, value: string) => {
    if (value === '') return
    await apiPut(`/api/settings/${encodeURIComponent(key)}`, { value })
    load()
  }

  const startEdit = (key: string, label: string, value: string) => {
    setEditKey(key)
    setForm({ key, value, label })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editKey) return
    await apiPut(`/api/settings/${encodeURIComponent(editKey)}`, { value: form.value })
    setEditKey(null)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Pengaturan</h1>
        <p className="text-text-muted text-sm mt-0.5">Kelola profil bisnis dan payment gateway.</p>
      </div>

      {/* Company profile */}
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6">
        <h3 className="font-display font-bold text-text-main mb-1">Profil Perusahaan</h3>
        <p className="text-text-muted text-sm mb-5">Informasi dasar yang tampil di website & invoice.</p>
        <div className="divide-y divide-border-minimal">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="py-3 flex justify-between gap-4">
                <div className="w-32 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
              </div>
            ))
          ) : (
            companyFields.map(f => (
              <div key={f.key} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-sm font-medium text-text-muted sm:w-40 shrink-0">{f.label}</span>
                <span className="flex-1 text-sm text-text-main break-words">{items[f.key] || '—'}</span>
                <button
                  onClick={() => startEdit(f.key, f.label, items[f.key] || '')}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm shrink-0"
                >
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment gateways */}
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6">
        <h3 className="font-display font-bold text-text-main mb-1">Payment Gateway</h3>
        <p className="text-text-muted text-sm mb-5">Pilih gateway aktif. Perubahan otomatis memengaruhi ToS, FAQ, & checkout.</p>
        <div className="space-y-3">
          {gatewayDefs.map(g => {
            const on = gateways.includes(g.id)
            return (
              <div key={g.id} className="p-4 rounded-xl border border-border-minimal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${g.color}`} />
                    <div>
                      <p className="font-medium text-text-main text-sm">{g.name}</p>
                      <p className={`text-xs ${on ? 'text-status-success' : 'text-text-muted'}`}>
                        {on ? 'Aktif' : 'Nonaktif'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleGateway(g.id, !on)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-brand-primary' : 'bg-gray-300'}`}
                    aria-pressed={on}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
                {on && (
                  <div className="mt-4 pt-4 border-t border-border-minimal space-y-3">
                    {g.keys.map(k => (
                      <div key={k.key}>
                        <label className="label text-xs">{k.label}</label>
                        {k.type === 'select' ? (
                          <select
                            className="form-input"
                            defaultValue={items[k.key] || 'sandbox'}
                            onChange={e => saveKey(k.key, e.target.value)}
                          >
                            {(k.options || []).map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : k.type === 'number' ? (
                          <input
                            type="number"
                            step="0.01"
                            className="form-input"
                            placeholder="0"
                            defaultValue={items[k.key] || ''}
                            onBlur={e => saveKey(k.key, e.target.value)}
                          />
                        ) : (
                          <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            defaultValue={items[k.key] || ''}
                            onBlur={e => saveKey(k.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {editKey && (
        <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6">
          <h3 className="font-display font-bold text-text-main mb-4">Edit {form.label}</h3>
          <form onSubmit={save} className="flex flex-col sm:flex-row gap-3">
            <input
              className="form-input flex-1"
              value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })}
              required
            />
            <button type="submit" className="btn-primary shrink-0">Simpan</button>
            <button type="button" onClick={() => setEditKey(null)} className="btn-secondary shrink-0">Batal</button>
          </form>
        </div>
      )}
    </div>
  )
}
