import { useEffect, useRef, useState } from 'react'

type FileRow = { name: string; size: number; order_id: string; at: string }

const hdrs = () => ({ Authorization: 'Bearer ' + (localStorage.getItem('token') || '') })

const human = (b: number) =>
  b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'

const pretty = (n: string) => n.replace(/^o\d+-/, '').replace(/^\d+-/, '')

export default function ClientFilesPage() {
  const [files, setFiles] = useState<FileRow[]>([])
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = () =>
    fetch('/api/client/files', { headers: hdrs() })
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((d) => setFiles(d.files || []))
      .catch(() => {})

  useEffect(() => {
    load()
  }, [])

  const upload = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setErr('')
    const f = inputRef.current?.files?.[0]
    if (!f) {
      setErr('Pilih berkas terlebih dahulu.')
      return
    }
    const fd = new FormData()
    fd.append('file', f)
    if (note) fd.append('note', note)
    setBusy(true)
    const res = await fetch('/api/client/files', { method: 'POST', headers: hdrs(), body: fd }).catch(() => null)
    const d = (res ? await res.json().catch(() => ({})) : {}) as { error?: string }
    setBusy(false)
    if (res && res.ok) {
      setMsg('Berkas terkirim: ' + f.name)
      setNote('')
      if (inputRef.current) inputRef.current.value = ''
      load()
    } else {
      setErr(d.error || 'Gagal mengunggah berkas.')
    }
  }

  const download = async (name: string) => {
    const r = await fetch('/api/client/files/' + encodeURIComponent(name), { headers: hdrs() }).catch(() => null)
    if (!r || !r.ok) {
      setErr('Gagal mengunduh berkas.')
      return
    }
    const b = await r.blob()
    const u = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = u
    a.download = pretty(name)
    a.click()
    URL.revokeObjectURL(u)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-text-main">Kirim Berkas</h1>
        <p className="text-text-muted text-sm mt-1.5">
          Unggah logo, materi konten, foto produk, atau dokumen untuk tim Logikraf. Maksimal 15 MB per berkas.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">{msg}</div>
      )}
      {err && <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">{err}</div>}

      <form onSubmit={upload} className="bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8 space-y-4">
        <div>
          <label className="label">Berkas</label>
          <input
            ref={inputRef}
            type="file"
            required
            accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.docx,.xlsx,.pptx,.txt,.csv,.zip,.rar,.ai,.psd,.mp4,.mov"
            className="block w-full text-xs text-text-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-primary file:text-white hover:file:opacity-90"
          />
        </div>
        <div>
          <label className="label">Catatan (opsional)</label>
          <input
            className="form-input text-sm"
            placeholder="Mis. logo versi terbaru beserta kode warna brand"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button className="btn-primary text-xs py-2.5 px-6" type="submit" disabled={busy}>
          {busy ? 'Mengunggah…' : 'Kirim Berkas'}
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border-minimal">
          <h3 className="font-display font-bold text-base text-text-main">Berkas Terkirim</h3>
        </div>
        {files.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada berkas yang Anda kirim.</p>
        ) : (
          <ul className="divide-y divide-border-minimal">
            {files.map((f) => (
              <li key={f.name} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-main truncate">{pretty(f.name)}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {human(f.size)} · {f.at}
                    {f.order_id ? ' · pesanan #' + f.order_id : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => download(f.name)}
                  className="text-xs font-bold text-brand-primary whitespace-nowrap hover:underline"
                >
                  Unduh
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
