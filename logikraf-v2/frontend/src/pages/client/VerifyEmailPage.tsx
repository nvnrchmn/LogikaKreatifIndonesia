import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMsg('Tautan tidak lengkap: token verifikasi tidak ditemukan.')
      return
    }
    let alive = true
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const d = (await res.json().catch(() => ({}))) as { message?: string; error?: string; email?: string }
        if (!alive) return
        if (res.ok) {
          setState('ok')
          setMsg('Email ' + (d.email || '') + ' berhasil diverifikasi.')
        } else {
          setState('error')
          setMsg(d.error || 'Verifikasi gagal.')
        }
      })
      .catch(() => {
        if (alive) {
          setState('error')
          setMsg('Tidak bisa menghubungi server. Coba lagi nanti.')
        }
      })
    return () => {
      alive = false
    }
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-light p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-border-minimal shadow-sm p-8 text-center">
        <h1 className="font-display font-black text-2xl text-text-main mb-2">Verifikasi Email</h1>
        {state === 'loading' && <p className="text-sm text-text-muted">Memeriksa tautan…</p>}
        {state !== 'loading' && (
          <div
            className={
              'mb-5 p-4 rounded-2xl text-xs font-bold border ' +
              (state === 'ok'
                ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary'
                : 'bg-red-50 border-red-200 text-red-600')
            }
          >
            {msg}
          </div>
        )}
        <Link to="/login" className="btn-primary inline-block w-full py-3 text-sm">
          Masuk ke Portal
        </Link>
      </div>
    </div>
  )
}
