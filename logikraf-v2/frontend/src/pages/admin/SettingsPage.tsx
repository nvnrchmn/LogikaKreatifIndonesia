import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../lib/api'

interface FieldSpec {
  key: string
  label: string
  type?: 'text' | 'password' | 'number' | 'select'
  options?: string[]
  placeholder?: string
  hint?: string
}

interface GatewaySpec {
  id: string
  name: string
  color: string
  tagline: string
  docsUrl: string
  keys: FieldSpec[]
}

const companyFields: FieldSpec[] = [
  { key: 'company_name', label: 'Nama Perusahaan / Entitas Legal', placeholder: 'PT. Logika Kreatif Indonesia' },
  { key: 'company_legal_form', label: 'Bentuk Badan Usaha', placeholder: 'Perseroan Perorangan' },
  { key: 'company_legal_updated', label: 'Tanggal Pembaruan Dokumen Legal (tetap)', placeholder: '12 September 2026' },
  { key: 'company_client_portal_url', label: 'URL Portal Klien (subdomain)', placeholder: 'https://client.logikraf.id' },
  { key: 'company_tagline', label: 'Slogan / Tagline Perusahaan', placeholder: 'Solusi Digital & Software House Terpercaya' },
  { key: 'company_legal_nib', label: 'Nomor Induk Berusaha (NIB)', placeholder: 'Contoh: 0123456789012' },
  { key: 'company_legal_npwp', label: 'Nomor Pokok Wajib Pajak (NPWP)', placeholder: 'Contoh: 01.234.567.8-901.000' },
  { key: 'company_founding_year', label: 'Tahun Pendirian', placeholder: '2024' },
]

const contactFields: FieldSpec[] = [
  { key: 'contact_whatsapp', label: 'Nomor WhatsApp Helpdesk Resmi (Aktif)', placeholder: '+62 812-3456-7890' },
  { key: 'contact_email', label: 'Email Helpdesk & Layanan Klien', placeholder: 'support@logikraf.id' },
  { key: 'contact_phone', label: 'Nomor Telepon Kantor / Helpdesk', placeholder: '+62 21 1234567' },
  { key: 'contact_hours', label: 'Jam Operasional Helpdesk', placeholder: 'Senin – Jumat, 09:00 – 18:00 WIB' },
  { key: 'contact_address', label: 'Alamat Helpdesk / Kantor Domisili', placeholder: 'Jakarta, DKI Jakarta, Indonesia' },
  { key: 'contact_maps_url', label: 'Tautan Google Maps Domisili Kantor', placeholder: 'https://maps.google.com/...' },
]

const gatewayDefs: GatewaySpec[] = [
  {
    id: 'ipaymu',
    name: 'iPaymu',
    color: 'bg-emerald-500',
    tagline: 'Payment gateway resmi Bank Indonesia (QRIS, VA Bank BCA/Mandiri/BNI/BRI/Permata, Alfamart/Indomaret).',
    docsUrl: 'https://my.ipaymu.com',
    keys: [
      {
        key: 'ipaymu_master_va',
        label: 'Master Virtual Account (VA) iPaymu',
        type: 'text',
        placeholder: 'Contoh: 1179000000000000 atau 0000001234567890',
        hint: 'Nomor VA Master dari menu Profil / Akun di dashboard iPaymu.',
      },
      {
        key: 'ipaymu_master_key',
        label: 'Master API Key / Secret Key iPaymu',
        type: 'password',
        placeholder: 'Tempel API Key dari menu Integrasi > API Key iPaymu',
        hint: 'Kunci otentikasi rahasia untuk menandatangani transaksi (HMAC-SHA256).',
      },
      {
        key: 'ipaymu_env',
        label: 'Mode Lingkungan (Environment)',
        type: 'select',
        options: ['sandbox', 'production'],
        hint: 'Gunakan "production" untuk menerima pembayaran nyata, atau "sandbox" untuk uji coba.',
      },
      {
        key: 'ipaymu_fee_percent',
        label: 'Biaya Provider iPaymu (%)',
        type: 'number',
        placeholder: '0',
        hint: 'Persentase MDR provider (misal: 0.7 untuk QRIS).',
      },
      {
        key: 'ipaymu_fee_flat',
        label: 'Biaya Flat iPaymu (Rp)',
        type: 'number',
        placeholder: '0',
        hint: 'Biaya tetap per transaksi (misal: 3500 untuk VA Bank).',
      },
    ],
  },
  {
    id: 'midtrans',
    name: 'Midtrans',
    color: 'bg-indigo-500',
    tagline: 'Payment aggregator Snap API (Kartu Kredit 3DS, GoPay, ShopeePay, Bank Transfer).',
    docsUrl: 'https://dashboard.midtrans.com',
    keys: [
      {
        key: 'midtrans_server_key',
        label: 'Server Key',
        type: 'password',
        placeholder: 'SB-Mid-server-... atau Mid-server-...',
        hint: 'Server Key dari menu Settings > Access Keys di dashboard Midtrans.',
      },
      {
        key: 'midtrans_client_key',
        label: 'Client Key',
        type: 'text',
        placeholder: 'SB-Mid-client-... atau Mid-client-...',
        hint: 'Client Key publik untuk inisialisasi frontend Snap modal.',
      },
      {
        key: 'midtrans_env',
        label: 'Environment',
        type: 'select',
        options: ['sandbox', 'production'],
      },
      {
        key: 'midtrans_fee_percent',
        label: 'Fee Midtrans (%)',
        type: 'number',
        placeholder: '0',
      },
      {
        key: 'midtrans_fee_flat',
        label: 'Fee Flat Midtrans (Rp)',
        type: 'number',
        placeholder: '0',
      },
    ],
  },
  {
    id: 'xendit',
    name: 'Xendit',
    color: 'bg-yellow-500',
    tagline: 'Payment gateway XenInvoice (Virtual Account, E-Wallet, Retail Outlet, Credit Card).',
    docsUrl: 'https://dashboard.xendit.co',
    keys: [
      {
        key: 'xendit_secret_key',
        label: 'Secret API Key',
        type: 'password',
        placeholder: 'xnd_development_... atau xnd_production_...',
        hint: 'Secret Key dari dashboard Xendit (Settings > API Keys).',
      },
      {
        key: 'xendit_webhook_token',
        label: 'Webhook Verification Token',
        type: 'password',
        placeholder: 'Token verifikasi webhook dari Xendit',
      },
      {
        key: 'xendit_fee_percent',
        label: 'Fee Xendit (%)',
        type: 'number',
        placeholder: '0',
      },
      {
        key: 'xendit_fee_flat',
        label: 'Fee Flat Xendit (Rp)',
        type: 'number',
        placeholder: '0',
      },
    ],
  },
]

export default function AdminSettingsPage() {
  const [items, setItems] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})

  const [gateways, setGateways] = useState<string[]>([])
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiGet('/api/settings')
      setItems((data as Record<string, string>) || {})
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

  useEffect(() => {
    load()
  }, [])

  const flash = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const toggleGateway = async (id: string, on: boolean) => {
    const next = on ? [...gateways, id] : gateways.filter(g => g !== id)
    setGateways(next)
    try {
      await apiPut(`/api/settings/${encodeURIComponent('payment_gateways')}`, { value: JSON.stringify(next) })
      flash('ok', `Gateway ${id.toUpperCase()} ${on ? 'diaktifkan' : 'dinonaktifkan'}`)
    } catch (err: any) {
      flash('err', err?.message || 'Gagal mengubah status gateway')
    }
  }

  const handleFieldChange = (key: string, value: string) => {
    setItems(prev => ({ ...prev, [key]: value }))
  }

  const saveSingleGateway = async (spec: GatewaySpec) => {
    setSavingKey(spec.id)
    try {
      for (const k of spec.keys) {
        const val = items[k.key] ?? (k.type === 'select' ? k.options?.[0] || 'sandbox' : '')
        await apiPut(`/api/settings/${encodeURIComponent(k.key)}`, { value: val })
      }
      // Otomatis aktifkan jika belum aktif
      if (!gateways.includes(spec.id)) {
        const next = [...gateways, spec.id]
        setGateways(next)
        await apiPut(`/api/settings/${encodeURIComponent('payment_gateways')}`, { value: JSON.stringify(next) })
      }
      flash('ok', `Pengaturan ${spec.name} berhasil disimpan dan diaktifkan!`)
    } catch (err: any) {
      flash('err', err?.message || `Gagal menyimpan pengaturan ${spec.name}`)
    } finally {
      setSavingKey(null)
    }
  }

  const saveCompanyProfile = async () => {
    setSavingKey('company')
    try {
      for (const f of companyFields) {
        const val = items[f.key] || ''
        await apiPut(`/api/settings/${encodeURIComponent(f.key)}`, { value: val })
      }
      flash('ok', 'Profil perusahaan & legalitas berhasil disimpan!')
    } catch (err: any) {
      flash('err', err?.message || 'Gagal menyimpan profil perusahaan')
    } finally {
      setSavingKey(null)
    }
  }

  const saveContactSettings = async () => {
    setSavingKey('contact')
    try {
      for (const f of contactFields) {
        const val = items[f.key] || ''
        await apiPut(`/api/settings/${encodeURIComponent(f.key)}`, { value: val })
      }
      flash('ok', 'Kontak & Helpdesk resmi berhasil disimpan!')
    } catch (err: any) {
      flash('err', err?.message || 'Gagal menyimpan kontak helpdesk')
    } finally {
      setSavingKey(null)
    }
  }

  const toggleShowSecret = (key: string) => {
    setShowSecret(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    flash('ok', `${label} berhasil disalin ke clipboard!`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-text-main tracking-tight">Pengaturan Sistem</h1>
        <p className="text-text-muted text-sm mt-1">Kelola kredensial Payment Gateway (iPaymu, Midtrans, Xendit) dan profil perusahaan.</p>
      </div>

      {toast && (
        <div className={`p-4 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-between gap-3 ${
          toast.type === 'ok'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">✕</button>
        </div>
      )}

      {/* Payment Gateway Settings */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-display font-bold text-text-main">Gerbang Pembayaran (Payment Gateway)</h2>
          <p className="text-xs text-text-muted mt-0.5">Konfigurasikan API Key dan nomor VA untuk menerima pembayaran otomatis dari klien.</p>
        </div>

        {gatewayDefs.map(g => {
          const on = gateways.includes(g.id)
          const isBusy = savingKey === g.id
          const isIPaymu = g.id === 'ipaymu'
          const isConfigured = isIPaymu
            ? Boolean(items['ipaymu_master_va'] && items['ipaymu_master_key'])
            : g.id === 'midtrans'
            ? Boolean(items['midtrans_server_key'])
            : Boolean(items['xendit_secret_key'])

          return (
            <div
              key={g.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                isIPaymu
                  ? 'border-emerald-200 ring-2 ring-emerald-500/10'
                  : 'border-border-minimal'
              }`}
            >
              {/* Header Gateway */}
              <div className="p-5 sm:p-6 border-b border-border-minimal flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas-overlay/30">
                <div className="flex items-start sm:items-center gap-3.5">
                  <span className={`w-3.5 h-3.5 rounded-full mt-1 sm:mt-0 shrink-0 ${g.color}`} />
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-display font-bold text-text-main text-base">{g.name}</h3>
                      {isIPaymu && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          Rekomendasi Utama
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        on
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {on ? '● Gateway Aktif' : '○ Nonaktif'}
                      </span>
                      {isConfigured ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px]">
                          ✓ Kredensial Terisi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium text-[11px]">
                          ⚠️ Kredensial Belum Lengkap
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{g.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-medium text-text-muted">{on ? 'Aktifkan' : 'Matikan'}</span>
                  <button
                    type="button"
                    onClick={() => toggleGateway(g.id, !on)}
                    className={`relative w-12 h-6.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                      on ? 'bg-brand-primary' : 'bg-gray-300'
                    }`}
                    aria-pressed={on}
                    aria-label={`Toggle ${g.name}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow transition-all ${
                        on ? 'left-[24px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Body Gateway Form */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Documentation / Webhook Helper Box */}
                <div className="p-4 bg-canvas-light rounded-xl border border-border-minimal flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-main">URL Webhook / Notification URL:</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-200/80 font-mono text-[10px] text-text-main">POST</span>
                    </div>
                    <p className="font-mono text-text-muted break-all text-[11px]">
                      {`${window.location.origin}/api/webhooks/${g.id}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/${g.id}`, `Webhook URL ${g.name}`)}
                      className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap active:scale-[0.98]"
                    >
                      📋 Salin URL Webhook
                    </button>
                    <a
                      href={g.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-primary hover:underline text-xs font-semibold whitespace-nowrap px-2"
                    >
                      Buka Dashboard {g.name} ↗
                    </a>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {g.keys.map(k => {
                    const isSecret = k.type === 'password'
                    const show = showSecret[k.key] || false
                    const val = items[k.key] ?? ''

                    return (
                      <div
                        key={k.key}
                        className={k.key === 'ipaymu_master_key' || k.key === 'midtrans_server_key' || k.key === 'xendit_secret_key' ? 'md:col-span-2' : ''}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-text-main">{k.label}</label>
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => toggleShowSecret(k.key)}
                              className="text-[11px] text-brand-primary hover:underline font-medium"
                            >
                              {show ? 'Sembunyikan' : 'Lihat'}
                            </button>
                          )}
                        </div>

                        {k.type === 'select' ? (
                          <select
                            className="form-input text-sm"
                            value={val || 'sandbox'}
                            onChange={e => handleFieldChange(k.key, e.target.value)}
                          >
                            {(k.options || []).map(o => (
                              <option key={o} value={o}>
                                {o === 'production' ? '🚀 Production (Live / Transaksi Nyata)' : '🧪 Sandbox (Uji Coba / Testing)'}
                              </option>
                            ))}
                          </select>
                        ) : k.type === 'number' ? (
                          <input
                            type="number"
                            step="0.01"
                            className="form-input text-sm"
                            placeholder={k.placeholder || '0'}
                            value={val}
                            onChange={e => handleFieldChange(k.key, e.target.value)}
                          />
                        ) : (
                          <div className="relative">
                            <input
                              type={isSecret && !show ? 'password' : 'text'}
                              className="form-input text-sm pr-10 font-mono"
                              placeholder={k.placeholder || ''}
                              value={val}
                              onChange={e => handleFieldChange(k.key, e.target.value)}
                            />
                            {val && (
                              <button
                                type="button"
                                onClick={() => handleFieldChange(k.key, '')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                title="Hapus teks"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        )}

                        {k.hint && (
                          <p className="text-[11px] text-text-muted mt-1 leading-normal">{k.hint}</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Save Button for this Gateway */}
                <div className="pt-3 border-t border-border-minimal flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-text-muted">
                    Pastikan Master VA & API Key sudah sesuai dengan akun dashboard Anda.
                  </p>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => saveSingleGateway(g)}
                    className="btn-primary text-sm py-2 px-5 whitespace-nowrap active:scale-[0.98] transition-all disabled:opacity-50 w-full sm:w-auto"
                  >
                    {isBusy ? 'Menyimpan...' : `Simpan Pengaturan ${g.name}`}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Company Profile Settings */}
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6 space-y-5">
        <div>
          <h2 className="font-display font-bold text-text-main text-base">Profil Perusahaan &amp; Legalitas</h2>
          <p className="text-xs text-text-muted mt-0.5">Informasi resmi yang tercantum pada header, footer, Terms of Service, dan Invoice.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {companyFields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-text-main mb-1 block">{f.label}</label>
              <input
                type="text"
                className="form-input text-sm"
                placeholder={f.placeholder || ''}
                value={items[f.key] || ''}
                onChange={e => handleFieldChange(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border-minimal flex justify-end">
          <button
            type="button"
            disabled={savingKey === 'company'}
            onClick={saveCompanyProfile}
            className="btn-secondary text-sm py-2 px-5 active:scale-[0.98] transition-all"
          >
            {savingKey === 'company' ? 'Menyimpan...' : 'Simpan Profil Perusahaan'}
          </button>
        </div>
      </div>

      {/* Helpdesk & Contact Settings */}
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-text-main text-base">Helpdesk &amp; Kontak Resmi</h2>
            <p className="text-xs text-text-muted mt-0.5">Pengaturan nomor WhatsApp, email helpdesk, dan alamat yang tampil di seluruh halaman website publik &amp; portal klien.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            💬 Live Support
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contactFields.map(f => (
            <div key={f.key} className={f.key === 'contact_address' || f.key === 'contact_maps_url' ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-bold text-text-main mb-1 block">{f.label}</label>
              <input
                type="text"
                className="form-input text-sm"
                placeholder={f.placeholder || ''}
                value={items[f.key] || ''}
                onChange={e => handleFieldChange(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border-minimal flex justify-end">
          <button
            type="button"
            disabled={savingKey === 'contact'}
            onClick={saveContactSettings}
            className="btn-primary text-sm py-2 px-5 active:scale-[0.98] transition-all"
          >
            {savingKey === 'contact' ? 'Menyimpan...' : 'Simpan Kontak & Helpdesk 💾'}
          </button>
        </div>
      </div>
    </div>
  )
}
