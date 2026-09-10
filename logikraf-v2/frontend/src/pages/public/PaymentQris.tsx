import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'

type QrisStatus = {
  reference_id: string
  external_id?: string
  amount: number
  currency?: string
  status: string
  mode?: string
  qr_string?: string
  paid_at?: string | null
  payer_name?: string
  expires_at?: string
  simulate_allowed?: boolean
}

const fmtRp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID')

// Branding halaman bayar — dinamis dari Settings LKI
type Branding = { logo: string; title: string; subtitle: string; footer: string }
const DEFAULT_BRANDING: Branding = {
  logo: '/logo.png',
  title: 'Pembayaran QRIS',
  subtitle: 'Selesaikan pembayaran pesananmu',
  footer: 'Pembayaran diproses aman oleh Xendit · QRIS diawasi Bank Indonesia',
}

export default function PaymentQris() {
  const { reference = '' } = useParams()
  const navigate = useNavigate()
  const [brand, setBrand] = useState<Branding>(DEFAULT_BRANDING)
  const [data, setData] = useState<QrisStatus | null>(null)
  const [qrImg, setQrImg] = useState('')
  const [err, setErr] = useState('')
  const [now, setNow] = useState(Date.now())
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  const fetchStatus = async () => {
    try {
      const r = await fetch('/api/payment/qris/' + encodeURIComponent(reference))
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'Gagal memuat pembayaran')
      setData(d)
      return d as QrisStatus
    } catch (e: any) {
      setErr(e.message || 'Gagal memuat pembayaran')
      return null
    }
  }

  useEffect(() => { fetchStatus() }, [reference])

  // Branding dinamis dari Settings (judul, subjudul, logo, catatan bawah)
  useEffect(() => {
    fetch('/api/settings/public').then(r => r.json()).then((d: any) => {
      const src = d?.data ?? d
      if (!src || typeof src !== 'object') return
      setBrand({
        logo: src.payment_logo_url || DEFAULT_BRANDING.logo,
        title: src.payment_header_title || DEFAULT_BRANDING.title,
        subtitle: src.payment_header_subtitle || DEFAULT_BRANDING.subtitle,
        footer: src.payment_footer_note || DEFAULT_BRANDING.footer,
      })
    }).catch(() => { /* pakai default */ })
  }, [])

  // Render QR dari qr_string (Xendit) memakai lib qrcode
  useEffect(() => {
    if (!data?.qr_string) return
    QRCode.toDataURL(data.qr_string, { width: 640, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQrImg)
      .catch(() => setErr('QR gagal dirender'))
  }, [data?.qr_string])

  // Kanal realtime (SSE) — UI berubah begitu status pembayaran berubah
  useEffect(() => {
    if (!reference) return
    const es = new EventSource('/api/payment/qris/' + encodeURIComponent(reference) + '/stream')
    esRef.current = es
    es.addEventListener('status', (ev: any) => {
      try {
        const d = JSON.parse(ev.data)
        setData(prev => prev ? { ...prev, status: d.status ?? prev.status, paid_at: d.paid_at ?? prev.paid_at } : prev)
        if (d.status === 'paid') { fetchStatus(); es.close() }
      } catch { /* payload rusak — diabaikan */ }
    })
    return () => es.close()
  }, [reference])

  // Polling fallback (kalau SSE diblokir proxy/jaringan) + tick countdown
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now())
      if (!data || data.status === 'paid' || data.status === 'expired') return
      fetchStatus()
    }, 4000)
    return () => clearInterval(t)
  }, [data?.status, reference])

  const expired = useMemo(() => !!data?.expires_at && new Date(data.expires_at).getTime() < now, [data?.expires_at, now])

  const countdown = useMemo(() => {
    if (!data?.expires_at) return ''
    const s = Math.max(0, Math.floor((new Date(data.expires_at).getTime() - now) / 1000))
    const m = Math.floor(s / 60)
    if (m >= 60) return `${Math.floor(m / 60)} jam ${m % 60} mnt`
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }, [data?.expires_at, now])

  const simulate = async () => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/payment/qris/' + encodeURIComponent(reference) + '/simulate', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'Simulasi gagal')
      await fetchStatus()
    } catch (e: any) { setErr(e.message || 'Simulasi gagal') } finally { setBusy(false) }
  }

  const downloadQr = () => {
    if (!qrImg) return
    const a = document.createElement('a')
    a.href = qrImg
    a.download = `QRIS-${data?.external_id || reference}.png`
    document.body.appendChild(a); a.click(); a.remove()
  }

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* diabaikan */ }
  }

  const paid = data?.status === 'paid'
  const dead = !!data && (data.status === 'expired' || data.status === 'failed' || expired)

  return (
    <div className="min-h-screen bg-canvas-light font-body px-4 py-10">
      <div className="mx-auto w-full max-w-md">

        {/* Brand — logo & teks dinamis dari Settings */}
        <div className="flex items-center justify-center mb-4">
          <img src={brand.logo} alt="Logo" className="h-11 w-auto object-contain" />
        </div>
        <div className="text-center mb-5">
          <h1 className="font-display font-bold text-text-main text-lg leading-tight">{brand.title}</h1>
          {brand.subtitle && <p className="text-xs text-text-muted mt-0.5">{brand.subtitle}</p>}
        </div>

        <div className="card p-5 sm:p-6">
          {err && <div className="alert-error mb-4">{err}</div>}

          {!data && !err && (
            <div className="py-16 text-center text-sm text-text-muted">Memuat pembayaran…</div>
          )}

          {data && (
            <>
              {/* Nominal */}
              <div className="text-center mb-5">
                <p className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Total Pembayaran</p>
                <p className="text-3xl font-display font-bold text-text-main">{fmtRp(data.amount)}</p>
                <p className="text-[11px] text-text-muted mt-1">Order {data.external_id || data.reference_id}</p>
              </div>

              {/* Status */}
              <div className="flex justify-center mb-5">
                {paid ? (
                  <span className="badge badge-success px-3 py-1.5 text-xs">✅ Pembayaran Diterima</span>
                ) : dead ? (
                  <span className="badge badge-danger px-3 py-1.5 text-xs">⏱ Kedaluwarsa</span>
                ) : (
                  <span className="badge badge-warning px-3 py-1.5 text-xs">⏳ Menunggu Pembayaran{countdown ? ` · ${countdown}` : ''}</span>
                )}
              </div>

              {paid ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center text-3xl mb-3">✅</div>
                  <p className="font-display font-bold text-text-main mb-1">Terima kasih!</p>
                  <p className="text-xs text-text-muted mb-5">
                    Pembayaran {fmtRp(data.amount)} sudah kami terima{data.paid_at ? ` pada ${new Date(data.paid_at).toLocaleString('id-ID')}` : ''}.
                  </p>
                  <button onClick={() => navigate('/paket?status=success')} className="btn-primary w-full">Selesai</button>
                </div>
              ) : dead ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-3xl mb-3">⏱</div>
                  <p className="font-display font-bold text-text-main mb-1">Waktu pembayaran habis</p>
                  <p className="text-xs text-text-muted">Silakan ulangi checkout untuk membuat QR baru.</p>
                </div>
              ) : (
                <>
                  {/* QR */}
                  <div className="rounded-xl border border-border-minimal bg-white p-3 w-fit mx-auto mb-3 shadow-sm">
                    {qrImg
                      ? <img src={qrImg} alt="QRIS" className="w-60 h-60 block" />
                      : <div className="w-60 h-60 flex items-center justify-center text-xs text-text-muted">Menyiapkan QR…</div>}
                  </div>
                  <p className="text-center text-[11px] text-text-muted mb-4">Satu QR untuk satu pembayaran · jangan dibagikan</p>

                  {/* Aksi QR */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={downloadQr} disabled={!qrImg} className="btn-secondary btn-sm !px-3 py-2.5">⬇️ Unduh QR</button>
                    <button onClick={copyLink} className="btn-secondary btn-sm !px-3 py-2.5">{copied ? '✅ Tersalin' : '🔗 Salin Link'}</button>
                  </div>

                  {/* Cara bayar */}
                  <div className="rounded-xl border border-border-minimal bg-canvas-overlay p-4 mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">Cara bayar</p>
                    <ol className="text-xs text-text-muted space-y-1.5 list-decimal list-inside">
                      <li>Buka m-banking atau e-wallet (GoPay, OVO, DANA, ShopeePay, LinkAja)</li>
                      <li>Pilih menu <b className="text-text-main">Bayar / Scan QRIS</b></li>
                      <li>Scan QR di atas — pastikan nominal <b className="text-text-main">{fmtRp(data.amount)}</b></li>
                      <li>Konfirmasi & masukkan PIN; halaman ini otomatis berubah saat lunas</li>
                    </ol>
                  </div>

                  {/* Mode tes */}
                  {data.simulate_allowed && (
                    <button onClick={simulate} disabled={busy}
                      className="w-full text-xs font-semibold py-2.5 rounded-lg border-2 border-dashed border-brand-primary/40 text-brand-primary hover:bg-brand-primary/5 transition">
                      {busy ? 'Memproses…' : '🧪 Simulasikan pembayaran berhasil (mode tes)'}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-text-muted mt-5">{brand.footer}</p>
      </div>
    </div>
  )
}
