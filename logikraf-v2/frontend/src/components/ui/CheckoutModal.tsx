import { useEffect, useState } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import Button from './Button'

/**
 * Reusable QRIS checkout modal used by both the landing page (PricingSection)
 * and the packages page. Gateway-aware: reads /api/payment-gateways and picks
 * the correct backend endpoint, exactly like the working PackagesPage flow.
 *
 * Nielsen heuristics applied:
 *  #1 Visibility — order summary + price always shown.
 *  #2 Match — copy/labels match backend (QRIS iPaymu/Xendit).
 *  #3 Control — ESC / backdrop / ✕ to close.
 *  #4 Consistency — same fields as admin & packages checkout.
 *  #5 Error prevention — required fields, inline validation.
 *  #6 Recognition — plain Indonesian labels (Nama PIC, WhatsApp).
 *  #7 Flexibility — optional note field.
 *  #8 Aesthetic — minimal, focused, no clutter.
 *  #9 Help — SSL + gateway hint.
 *  #10 Error recovery — clear error banner, retry allowed.
 */
interface Gateway {
  id: string
  name: string
}

interface Pkg {
  id: number
  name: string
  price: number
  formatted_price?: string
}

interface Props {
  open: boolean
  pkg: Pkg | null
  onClose: () => void
}

const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function CheckoutModal({ open, pkg, onClose }: Props) {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open) return
    setErr('')
    fetch('/api/payment-gateways')
      .then((r) => r.json())
      .then((d) => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))
  }, [open])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pkg) return
    setBusy(true)
    setErr('')
    const gw = gateways.length > 0 ? gateways[0] : { id: 'ipaymu', name: 'iPaymu' }
    const endpoint = gw.id === 'xendit' ? '/api/payment/xendit/invoice' : `/api/payment/${gw.id}/snap`
    const payload = {
      order_id: `LK-${Date.now()}-${pkg.id}`,
      amount: Number(pkg.price),
      first_name: form.name,
      email: form.email,
      phone: form.phone,
      description: `Paket ${pkg.name} - Logikraf`,
      paymentMethod: 'qris',
      paymentChannel: 'qris',
    }
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || data?.Message || 'Gagal memproses pembayaran.')
      const url = data.redirect_url || data.invoice_url || data.payment_url || data.Data?.Url || data.url
      if (url) window.location.href = url
      else throw new Error('Tautan pembayaran tidak ditemukan.')
    } catch (e: any) {
      setErr(e.message || 'Gagal memproses pembayaran. Hubungi admin via WhatsApp.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        pkg && (
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary block mb-1">
              Konfirmasi Pembayaran
            </span>
            <h3 className="text-xl font-extrabold text-text-main">Pesan {pkg.name}</h3>
            <p className="text-xs text-text-muted mt-1">
              Lengkapi identitas PIC pemesan untuk penerbitan faktur dan alur pembayaran QRIS.
            </p>
          </div>
        )
      }
    >
      {pkg && (
        <>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-gray-900">{pkg.name}</p>
              <p className="text-[11px] text-gray-500 font-mono">Metode: QRIS Nasional (iPaymu)</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-extrabold text-base text-emerald-700">
                {pkg.formatted_price || fmt(pkg.price)}
              </p>
              <span className="text-[10px] text-gray-500">Termasuk PPN &amp; Server</span>
            </div>
          </div>

          {err && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{err}</div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            <FormField
              label="Nama Lengkap PIC"
              required
              placeholder="Budi Santoso"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Email Aktif"
                type="email"
                required
                placeholder="budi@perusahaan.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <FormField
                label="WhatsApp / No HP"
                type="tel"
                required
                placeholder="08123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <FormField
              label="Catatan (opsional)"
              placeholder="Tambahan informasi pesanan"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />

            <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span>🔒</span>
                <span>Transaksi Terenkripsi SSL</span>
              </div>
              <Button type="submit" loading={busy}>
                {busy ? 'Memproses QRIS...' : 'Lanjut Bayar QRIS →'}
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  )
}
