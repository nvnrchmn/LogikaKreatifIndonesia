import { useEffect, useState } from 'react'

const auth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
})

interface CronJob {
  id: number
  job_key: string
  name: string
  description: string
  schedule: string
  is_enabled: boolean
  last_run_at: string | null
  last_status: string | null
  last_duration_ms: number | null
}

interface CronLog {
  id: number
  triggered_at: string
  finished_at: string | null
  duration_ms: number | null
  status: string
  output: string | null
  error_message: string | null
}

const statusColors: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  running: 'bg-blue-50 text-blue-700 border-blue-200',
}

const fmt = (d: string | null) => d ? new Date(d).toLocaleString('id-ID', { hour12: false }) : '—'

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SpinIcon = () => (
  <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path strokeLinecap="round" d="M12 2a10 10 0 0110 10" />
  </svg>
)

const statusIcons: Record<string, React.ReactNode> = {
  success: <CheckIcon />,
  failed: <XIcon />,
  running: <SpinIcon />,
}

const PlayIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [logs, setLogs] = useState<CronLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/cron/jobs', { headers: auth() })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Gagal memuat')
      setJobs(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat')
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async (jobId: number) => {
    const res = await fetch(`/api/cron/jobs/${jobId}/logs`, { headers: auth() })
    const data = await res.json()
    setLogs(Array.isArray(data) ? data : [])
  }

  const toggle = async (job: CronJob) => {
    setBusy(job.job_key)
    try {
      const res = await fetch(`/api/cron/jobs/${job.id}`, {
        method: 'PUT',
        headers: auth(),
        body: JSON.stringify({ is_enabled: !job.is_enabled }),
      })
      if (!res.ok) throw new Error('Gagal memperbarui')
      await load()
    } finally {
      setBusy(null)
    }
  }

  const run = async (key: string) => {
    setBusy(key)
    try {
      await fetch(`/api/cron/jobs/${key}/run`, {
        method: 'POST',
        headers: auth(),
        body: JSON.stringify({}),
      })
      await load()
    } finally {
      setBusy(null)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (jobs.length) loadLogs(jobs[0].id) }, [jobs])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-text-main text-lg">Otomatis (Cron Job)</h2>
          <p className="text-text-muted text-xs mt-0.5">
            Atur jadwal tugas otomatis — tanpa perlu crontab.
          </p>
        </div>
        <button onClick={load} className="btn-secondary text-xs py-2 px-4">Refresh</button>
      </div>

      {error && (
        <p className="text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {loading ? (
          <>
            {[0, 1].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-5 space-y-3 animate-pulse">
                <div className="h-4 w-40 bg-gray-100 rounded" />
                <div className="h-3 w-64 bg-gray-100 rounded" />
                <div className="h-8 w-full bg-gray-100 rounded" />
              </div>
            ))}
          </>
        ) : (
          jobs.map(j => (
            <div key={j.id} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    j.is_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-main text-sm">{j.name}</p>
                    <p className="text-[11px] text-text-muted">{j.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(j)}
                  disabled={busy === j.job_key}
                  className={`text-xs font-bold py-1.5 px-3 rounded-full border ${
                    j.is_enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {busy === j.job_key ? '...' : j.is_enabled ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div className="bg-canvas-overlay rounded-lg p-2.5">
                  <p className="text-text-muted">Jadwal</p>
                  <p className="font-mono font-bold text-text-main mt-0.5">{j.schedule}</p>
                </div>
                <div className="bg-canvas-overlay rounded-lg p-2.5">
                  <p className="text-text-muted">Terakhir jalan</p>
                  <p className="font-bold text-text-main mt-0.5">{fmt(j.last_run_at)}</p>
                </div>
                <div className="bg-canvas-overlay rounded-lg p-2.5">
                  <p className="text-text-muted">Status terakhir</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {j.last_status && statusIcons[j.last_status] ? (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        statusColors[j.last_status] || 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {statusIcons[j.last_status]} {j.last_status}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => loadLogs(j.id)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Riwayat
                </button>
                <button
                  onClick={() => run(j.job_key)}
                  disabled={busy === j.job_key}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <PlayIcon />
                  {busy === j.job_key ? 'Jalankan...' : 'Jalankan Sekarang'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border-minimal bg-canvas-overlay/60">
          <p className="font-bold text-text-main text-sm">Riwayat Eksekusi</p>
        </div>
        {logs.length === 0 ? (
          <p className="px-5 py-8 text-center text-text-muted text-xs">Belum ada riwayat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-minimal text-left">
                  <th className="font-bold text-text-main py-2.5 px-4">Waktu</th>
                  <th className="font-bold text-text-main py-2.5 px-4">Status</th>
                  <th className="font-bold text-text-main py-2.5 px-4">Durasi</th>
                  <th className="font-bold text-text-main py-2.5 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-minimal">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-canvas-light/60">
                    <td className="py-2.5 px-4 text-text-main font-mono">{fmt(l.triggered_at)}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        statusColors[l.status] || 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {statusIcons[l.status]} {l.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-text-muted">
                      {l.duration_ms ? `${l.duration_ms}ms` : '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      {l.status === 'failed' ? (
                        <span className="text-rose-600">{l.error_message || 'Error'}</span>
                      ) : (
                        <span className="text-text-muted">{l.output || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
