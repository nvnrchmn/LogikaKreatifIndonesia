import { useEffect, useState } from 'react'

type Notif = {
  id: number
  title: string
  body: string
  link: string
  read_at: string | null
  created_at: string
}

export default function ClientNotificationsPage() {
  const [rows, setRows] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token') || ''

  const load = async () => {
    const res = await fetch('/api/client/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
    if (res && res.ok) {
      const d = (await res.json()) as { notifications?: Notif[] }
      setRows(d.notifications || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const markAll = async () => {
    await fetch('/api/client/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
    load()
  }

  const open = async (n: Notif) => {
    if (!n.read_at) {
      await fetch(`/api/client/notifications/${n.id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)
    }
    if (n.link) window.location.href = n.link
    else load()
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-black text-xl text-text-main">Notifikasi</h1>
        <button onClick={markAll} className="text-xs font-bold text-brand-primary">
          Tandai semua dibaca
        </button>
      </div>
      {loading && <p className="text-sm text-text-muted">Memuat…</p>}
      {!loading && rows.length === 0 && (
        <div className="bg-white rounded-3xl border border-border-minimal p-6 text-sm text-text-muted">
          Belum ada notifikasi. Kabar pesanan dan balasan tiket akan muncul di sini.
        </div>
      )}
      <div className="space-y-3">
        {rows.map((n) => (
          <button
            key={n.id}
            onClick={() => open(n)}
            className={`w-full text-left bg-white rounded-2xl border p-4 ${n.read_at ? 'border-border-minimal' : 'border-brand-primary/40'}`}
          >
            <div className="flex items-center gap-2">
              {!n.read_at && <span className="w-2 h-2 rounded-full bg-brand-primary" />}
              <span className="text-sm font-bold text-text-main">{n.title}</span>
            </div>
            {n.body && (
              <p className="text-xs text-text-muted mt-1 whitespace-pre-line">{n.body}</p>
            )}
            <p className="text-[10px] text-text-muted mt-2">{n.created_at}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
