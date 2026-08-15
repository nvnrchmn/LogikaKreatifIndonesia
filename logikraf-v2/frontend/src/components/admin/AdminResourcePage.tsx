import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { crudConfigs, type FieldDef, type ColumnDef } from './crudConfigs'

const auth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
})

export default function AdminResourcePage() {
  const { resource, id } = useParams()
  const navigate = useNavigate()
  const cfg = resource ? crudConfigs[resource] : undefined

  if (!cfg) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white rounded-3xl border border-border-minimal shadow-sm my-8">
        <h3 className="font-display font-bold text-lg text-text-main mb-2">Modul Tidak Ditemukan</h3>
        <p className="text-text-muted text-xs mb-6">Modul yang Anda akses belum terdaftar pada sistem konfigurasi.</p>
        <Link to="/admin/dashboard" className="btn-primary text-xs py-2.5 px-5">← Kembali ke Dashboard</Link>
      </div>
    )
  }

  // EDIT / NEW mode → dedicated page
  if (id || window.location.pathname.endsWith('/new')) {
    return <ResourceForm cfg={cfg} id={id} onDone={() => navigate(`/admin/${cfg.resource}`)} />
  }

  // LIST mode
  return <ResourceList cfg={cfg} />
}

function ResourceList({ cfg }: { cfg: any }) {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(cfg.endpoint, { headers: auth() })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Gagal memuat data dari server')
      }
      setItems(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [cfg.endpoint])

  // Heuristic #3 & #7: User control and freedom with Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeleteId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${cfg.endpoint}/${id}`, { method: 'DELETE', headers: auth() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || data?.message || 'Gagal menghapus data')
      setDeleteId(null)
      setToast('Data berhasil dihapus!')
      setTimeout(() => setToast(''), 2500)
      load()
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus data')
    }
  }

  // Heuristic #2: Match between system and real world (auto currency/date format)
  const formatCell = (c: ColumnDef, item: any) => {
    if (c.render) return c.render(item)
    const val = item[c.id]
    if (typeof val === 'number' && /harga|amount|total|budget|fee|biaya|price/i.test(c.label || c.id)) {
      return `Rp ${val.toLocaleString('id-ID')}`
    }
    return val !== null && val !== undefined ? String(val) : '-'
  }

  const filtered = Array.isArray(items)
    ? items.filter((it: any) =>
        cfg.columns.some((c: ColumnDef) => {
          const v = c.render ? c.render(it) : it[c.id]
          return String(v ?? '')
            .toLowerCase()
            .includes(q.trim().toLowerCase())
        })
      )
    : []

  return (
    <div className="max-w-6xl mx-auto admin-page pb-12">
      <nav className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link to="/admin" className="hover:text-brand-primary">Admin</Link>
        <span>/</span>
        <span className="text-text-main font-semibold">{cfg.title}</span>
      </nav>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-text-main">{cfg.title}</h1>
          <p className="text-xs text-text-muted mt-0.5">Kelola dan perbarui data master {cfg.title.toLowerCase()}.</p>
        </div>
        <button
          onClick={() => navigate(`/admin/${cfg.resource}/new`)}
          className="btn-primary text-xs py-2 px-4 shadow-sm active:scale-[0.98] transition-transform"
        >
          + Tambah {cfg.title}
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="underline font-bold ml-2">Coba Lagi</button>
        </div>
      )}

      {toast && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          {toast}
        </div>
      )}

      {/* Filter bar — Nielsen #6: find rows fast without leaving the page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={`Cari ${cfg.title.toLowerCase()}...`}
            className="form-input pl-10 text-xs py-2"
            aria-label={`Cari ${cfg.title}`}
          />
        </div>
        <span className="text-xs text-text-muted shrink-0 font-medium">
          {loading ? 'Memuat...' : `${filtered.length} data ditemukan`}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-3xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border-minimal bg-canvas-overlay/60">
                {cfg.columns.map((c: ColumnDef) => (
                  <th key={c.id} className="text-left font-bold text-text-main py-3.5 px-4">
                    {c.label}
                  </th>
                ))}
                <th className="text-right font-bold text-text-main py-3.5 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-minimal">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {cfg.columns.map((_: any, ci: number) => (
                      <td key={ci} className="py-4 px-4">
                        <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                    <td className="py-4 px-4" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={cfg.columns.length + 1} className="px-4 py-14 text-center">
                    <p className="text-text-main font-semibold text-sm mb-1">
                      {q ? 'Tidak ada hasil pencarian.' : cfg.emptyRow}
                    </p>
                    <p className="text-text-muted text-xs mb-4">
                      {q ? 'Coba gunakan kata kunci lain.' : 'Mulai dengan menambahkan data pertama.'}
                    </p>
                    {!q && (
                      <button
                        onClick={() => navigate(`/admin/${cfg.resource}/new`)}
                        className="btn-primary text-xs py-2 px-4 shadow-sm"
                      >
                        + Tambah {cfg.title}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((item: any) => (
                  <tr key={item.id} className="hover:bg-canvas-light/60 transition-colors">
                    {cfg.columns.map((c: ColumnDef) => (
                      <td key={c.id} className="py-3.5 px-4 text-text-main">
                        {formatCell(c, item)}
                      </td>
                    ))}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/${cfg.resource}/${item.id}/edit`)}
                        className="text-brand-primary hover:underline font-semibold text-xs mr-3 active:scale-[0.98]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-600 hover:underline font-semibold text-xs active:scale-[0.98]"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-border-minimal animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-minimal p-8 text-center">
            <p className="text-text-main font-semibold text-sm mb-1">
              {q ? 'Tidak ada hasil.' : cfg.emptyRow}
            </p>
            {!q && (
              <button
                onClick={() => navigate(`/admin/${cfg.resource}/new`)}
                className="btn-primary text-xs py-2 px-4 mt-2"
              >
                + Tambah {cfg.title}
              </button>
            )}
          </div>
        ) : (
          filtered.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-4 space-y-2">
              {cfg.columns
                .filter((c: ColumnDef) => c.id !== 'id')
                .map((c: ColumnDef) => (
                  <div key={c.id} className="flex justify-between gap-3 text-xs">
                    <span className="text-text-muted shrink-0">{c.label}</span>
                    <span className="text-text-main text-right font-medium">{formatCell(c, item)}</span>
                  </div>
                ))}
              <div className="flex gap-3 pt-3 mt-1 border-t border-border-minimal justify-end">
                <button
                  onClick={() => navigate(`/admin/${cfg.resource}/${item.id}/edit`)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="bg-red-50 text-red-700 font-semibold text-xs py-1.5 px-3 rounded-xl hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
            <h3 className="font-display font-bold text-text-main text-lg">Konfirmasi Hapus</h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Apakah Anda yakin ingin menghapus data ini? Data yang terhapus tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary text-xs py-2.5 flex-1"
              >
                Batal (Esc)
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex-1 active:scale-[0.98]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResourceForm({ cfg, id, onDone }: { cfg: any; id?: string; onDone: () => void }) {
  const [form, setForm] = useState<Record<string, any>>({})
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      const init: Record<string, any> = {}
      cfg.formFields.forEach((f: FieldDef) => {
        if (f.type === 'select' && f.options?.length) init[f.name] = f.options[0].value
      })
      setForm(init)
      setLoadingInitial(false)
      return
    }

    fetch(cfg.endpoint, { headers: auth() })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error || 'Gagal memuat data')
        return Array.isArray(data) ? data : []
      })
      .then((rows: any[]) => {
        const row = (rows || []).find((x: any) => String(x.id) === String(id)) || {}
        const init = { ...row }
        cfg.formFields.forEach((f: FieldDef) => {
          if (f.type === 'select') {
            init[f.name] =
              row[f.name] === true ? '1' : row[f.name] === false ? '0' : String(row[f.name] ?? '')
          }
        })
        setForm(init)
        setLoadingInitial(false)
      })
      .catch((err: any) => {
        setError(err?.message || 'Gagal memuat data')
        setLoadingInitial(false)
      })
  }, [cfg, id])

  const validate = () => {
    const errs: Record<string, string> = {}
    cfg.formFields.forEach((f: FieldDef) => {
      const v = form[f.name]
      if (f.required && (v === undefined || v === null || String(v).trim() === '')) {
        errs[f.name] = `${f.label} wajib diisi`
      }
    })
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setBusy(true)

    const payload = { ...form }
    cfg.formFields.forEach((f: FieldDef) => {
      if (f.type === 'select') {
        payload[f.name] = payload[f.name] === '1' || payload[f.name] === true
      }
      if (f.type === 'number' && payload[f.name] !== undefined && payload[f.name] !== '') {
        payload[f.name] = Number(payload[f.name])
      }
    })

    try {
      let res: Response
      if (id) {
        res = await fetch(`${cfg.endpoint}/${id}`, {
          method: 'PUT',
          headers: auth(),
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(cfg.endpoint, {
          method: 'POST',
          headers: auth(),
          body: JSON.stringify(payload),
        })
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Gagal menyimpan data ke database')
      }
      onDone()
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan data')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto admin-page pb-12">
      <nav className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link to="/admin" className="hover:text-brand-primary">Admin</Link>
        <span>/</span>
        <Link to={`/admin/${cfg.resource}`} className="hover:text-brand-primary">{cfg.title}</Link>
        <span>/</span>
        <span className="text-text-main font-semibold">{id ? 'Edit' : 'Tambah'}</span>
      </nav>

      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-display font-bold text-text-main mb-6">
          {id ? 'Edit' : 'Tambah'} {cfg.title}
        </h1>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {loadingInitial ? (
          <div className="space-y-4 py-8">
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : (
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            {cfg.formFields.map((f: FieldDef) => (
              <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="text-xs font-bold text-text-main mb-1.5 block">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    className={`form-input text-xs sm:text-sm resize-none ${
                      fieldErrors[f.name] ? 'border-red-400 ring-1 ring-red-400' : ''
                    }`}
                    rows={f.rows || 3}
                    value={form[f.name] || ''}
                    onChange={e => {
                      setForm({ ...form, [f.name]: e.target.value })
                      if (fieldErrors[f.name]) setFieldErrors({ ...fieldErrors, [f.name]: '' })
                    }}
                  />
                ) : f.type === 'select' ? (
                  <select
                    className={`form-input text-xs sm:text-sm ${
                      fieldErrors[f.name] ? 'border-red-400 ring-1 ring-red-400' : ''
                    }`}
                    value={form[f.name] ?? ''}
                    onChange={e => {
                      setForm({ ...form, [f.name]: e.target.value })
                      if (fieldErrors[f.name]) setFieldErrors({ ...fieldErrors, [f.name]: '' })
                    }}
                  >
                    {f.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`form-input text-xs sm:text-sm ${
                      fieldErrors[f.name] ? 'border-red-400 ring-1 ring-red-400' : ''
                    }`}
                    type={f.type || 'text'}
                    value={form[f.name] ?? ''}
                    onChange={e => {
                      setForm({ ...form, [f.name]: e.target.value })
                      if (fieldErrors[f.name]) setFieldErrors({ ...fieldErrors, [f.name]: '' })
                    }}
                  />
                )}
                {fieldErrors[f.name] && (
                  <p className="text-red-600 text-[11px] mt-1">{fieldErrors[f.name]}</p>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-4 md:col-span-2 border-t border-border-minimal">
              <button
                type="submit"
                disabled={busy}
                className="btn-primary text-xs py-2.5 px-6 shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? 'Menyimpan...' : 'Simpan Data 💾'}
              </button>
              <button
                type="button"
                onClick={onDone}
                className="btn-secondary text-xs py-2.5 px-5"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
