import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../lib/api'

interface HeroStat {
  id: number
  num: string
  label: string
  sort_order: number
}

export default function HeroStatsPage() {
  const [stats, setStats] = useState<HeroStat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    apiGet('/api/hero-stats')
      .then(d => setStats((d.data as HeroStat[]) || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await apiPut('/api/hero-stats', stats)
      setMessage('✅ Perubahan disimpan')
    } catch {
      setMessage('❌ Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-fg-muted">Loading...</div>

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-fg mb-6">Hero Stats</h1>
      <p className="text-sm text-fg-muted mb-6">Edit statistik yang ditampilkan di halaman utama</p>

      <div className="space-y-4">
        {stats.map((s, i) => (
          <div key={s.id} className="bg-bg-card border border-bg-border rounded-lg p-4">
            <label className="text-xs text-fg-muted mb-1.5 block">Stat #{s.sort_order}</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={s.num}
                onChange={e => {
                  const newStats = [...stats]
                  newStats[i] = { ...s, num: e.target.value }
                  setStats(newStats)
                }}
                placeholder="Contoh: 50+"
                className="flex h-10 w-full rounded-lg border border-bg-border bg-bg-card px-3 py-2 text-sm text-fg placeholder:text-fh-muted/50 focus:border-fg-muted/40 focus:outline-none"
              />
              <input
                type="text"
                value={s.label}
                onChange={e => {
                  const newStats = [...stats]
                  newStats[i] = { ...s, label: e.target.value }
                  setStats(newStats)
                }}
                placeholder="Contoh: Proyek Selesai"
                className="flex h-10 w-full rounded-lg border border-bg-border bg-bg-card px-3 py-2 text-sm text-fg placeholder:text-fh-muted/50 focus:border-fg-muted/40 focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm">{message}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  )
}
