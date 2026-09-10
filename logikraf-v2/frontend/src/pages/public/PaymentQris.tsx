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

export default function PaymentQris() {
  const { reference = '' } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<QrisStatus | null>(null)
  const [qrImg, setQrImg] = useState('')
  const [err, setErr] = useState('')
  const [now, setNow] = useState(Date.now())
  const [busy, setBusy] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  // Ambil status via API (dipakai pertama kali & sebagai fallback polling)
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

  // Render QR dari qr_string
  useEffect(() => {
    if (!data?.qr_string) return
    QRCode.toDataURL(data.qr_string, { width: 520, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQrImg)
      .catch(() => setErr('QR gagal dirender'))
  }, [data?.qr_string])

  // Kanal realtime (SSE) — begitu status berubah, UI langsung ikut
  useEffect(() => {
    if (!reference) return
    const es = new EventSource('/api/payment/qris/' + encodeURIComponent(reference) + '/stream')
    esRef.current = es
    es.addEventListener('status', (ev: any) => {
      try {
        const d = JSON.parse(ev.data)
        setData(prev => prev ? { ...prev, status: d.status ?? prev.status, paid_at: d.paid_at ?? prev.paid_at } : prev)
        if (d.status === 'paid') { fetchStatus(); es.close() }
      } catch { /* abaikan payload rusak */ }
    })
    es.onerror = () => { /* biarkan polling fallback mengambil alih */ }
    return () => es.close()
  }, [reference])

  // Polling fallback (kalau SSE diblokir jaringan/proxy) + hitung countdown
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now())
      if (!data || data.status === 'paid' || data.status === 'expired') return
      fetchStatus()
    }, 4000)
    return () => clearInterval(t)
  }, [data?.status, reference])

  const expired = useMemo(() => {
    if (!data?.expires_at) return false
    return new Date(data.expires_at).getTime() < now
  }, [data?.expires_at, now])

  const countdown = useMemo(() => {
    if (!data?.expires_at) return ''
    const s = Math.max(0, Math.floor((new Date(data.expires_at).getTime() - now) / 1000))
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }, [data?.expires_at, now])

  const simulate = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/payment/qris/' + encodeURIComponent(reference) + '/simulate', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'Simulasi gagal')
      await fetchStatus()
    } catch (e: any) { setErr(e.message || 'Simulasi gagal') } finally { setBusy(false) }
  }

  const paid = data?.status === 'paid'
  const dead = data?.status === 'expired' || data?.status === 'failed' || expired

  return (
    <div className="min-h-screen bg-base text-mist flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center font-black text-base">L</div>
          <span className="font-bold tracking-tight">Logikraf <span className="text-faint font-normal">· Pembayaran QRIS</span></span>
        </div>

        <div className="bg-panel border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
          {err && <div className="mb-4 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">{err}</div>}

          {!data && !err && <div className="py-16 text-center text-sm text-faint">Memuat pembayaran…</div>}

          {data && (
            <>
              {/* Nominal */}
              <div className="text-center mb-5">
                <p className="text-[11px] uppercase tracking-widest text-faint mb-1">Total Pembayaran</p>
                <p className="text-3xl font-black text-white">{fmtRp(data.amount)}</p>
                <p className="text-[11px] text-faint mt-1">Order {data.external_id || data.reference_id}</p>
              </div>

              {/* Status chip */}
              <div className="flex justify-center mb-5">
                {paid ? (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✅ Pembayaran Diterima</span>
                ) : dead ? (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">⏱ Kedaluwarsa</span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">⏳ Menunggu Pembayaran · {countdown}</span>
                )}
              </div>

              {/* QR / status akhir */}
              {paid ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl mb-3">✅</div>
                  <p className="font-bold text-white mb-1">Terima kasih!</p>
                  <p className="text-xs text-faint mb-5">Pembayaran {fmtRp(data.amount)} sudah kami terima{data.paid_at ? ` pada ${new Date(data.paid_at).toLocaleString('id-ID')}` : ''}.</p>
                  <button onClick={() => navigate('/checkout/success')} className="w-full d-btn justify-center py-3">Selesai</button>
                </div>
              ) : dead ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-3xl mb-3">⏱</div>
                  <p className="font-bold text-white mb-1">Waktu pembayaran habis</p>
                  <p className="text-xs text-faint">Silakan ulangi checkout untuk membuat QR baru.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl p-3 w-fit mx-auto mb-4">
                    {qrImg
                      ? <img src={qrImg} alt="QRIS" className="w-60 h-60 block" />
                      : <div className="w-60 h-60 flex items-center justify-center text-xs text-gray-500">Menyiapkan QR…</div>}
                  </div>
                  <p className="text-center text-[11px] text-faint mb-4">Satu QR untuk satu pembayaran · jangan dibagikan</p>

                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3.5 mb-4">
                    <p className="text-[11px] font-bold text-mist uppercase tracking-wider mb-2">Cara bayar</p>
                    <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
                      <li>Buka aplikasi m-banking atau e-wallet (GoPay, OVO, DANA, ShopeePay, LinkAja)</li>
                      <li>Pilih menu <b>Bayar / Scan QRIS</b></li>
                      <li>Scan QR di atas, pastikan nominal <b>{fmtRp(data.amount)}</b></li>
                      <li>Konfirmasi & masukkan PIN — halaman ini otomatis berubah saat lunas</li>
                    </ol>
                  </div>

                  {data.simulate_allowed && (
                    <button onClick={simulate} disabled={busy} className="w-full text-xs font-semibold py-2.5 rounded-xl border border-dashed border-accent/40 text-accent-light hover:bg-accent/10 transition">
                      {busy ? 'Memproses…' : '🧪 Simulasikan pembayaran berhasil (mode tes)'}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-faint mt-5">
          Pembayaran diproses aman oleh Xendit · QRIS diawasi Bank Indonesia
        </p>
      </div>
    </div>
  )
}
