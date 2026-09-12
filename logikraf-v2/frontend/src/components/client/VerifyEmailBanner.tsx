import { useEffect, useState } from 'react'

// Pengingat halus bila email klien belum diverifikasi. Tidak memblokir akses:
// klien lama belum terverifikasi dan tidak boleh dikunci.
export default function VerifyEmailBanner() {
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) return
    ;(async () => {
      const res = await fetch('/api/client/profile', {
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => null)
      if (!res || !res.ok) return
      const d = (await res.json().catch(() => ({}))) as { email_verified?: boolean }
      if (d.email_verified === false) setShow(true)
    })()
  }, [])

  if (!show) return null

  const resend = async () => {
    setBusy(true)
    setNote('')
    const t = localStorage.getItem('token') || ''
    const res = await fetch('/api/client/resend-verification', {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
    }).catch(() => null)
    const d = (res ? await res.json().catch(() => ({})) : {}) as { message?: string; error?: string }
    setNote(d.message || d.error || 'Tautan dikirim ke email Anda.')
    setBusy(false)
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 shadow-lg p-4">
        <div className="text-[13px] font-bold text-amber-900">Email Anda belum diverifikasi</div>
        <p className="text-[11px] text-amber-800 mt-0.5">
          {note || 'Kami kirim tautan verifikasi ke email Anda supaya invoice dan pemberitahuan tidak salah tujuan.'}
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={resend} disabled={busy} className="btn-primary px-3 py-2 text-[11px]">
            {busy ? 'Mengirim...' : 'Kirim ulang tautan'}
          </button>
          <button onClick={() => setShow(false)} className="px-3 py-2 text-[11px] font-bold text-amber-800">
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  )
}
