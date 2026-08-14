import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { crudConfigs, type FieldDef, type ColumnDef } from './crudConfigs'

const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })

export default function AdminResourcePage() {
  const { resource, id } = useParams()
  const navigate = useNavigate()
  const cfg = resource ? crudConfigs[resource] : undefined

  if (!cfg) {
    return <div className="p-6 text-text-muted">Modul tidak ditemukan.</div>
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
    try { setItems(await (await fetch(cfg.endpoint, { headers: auth() })).json()) }
    catch { setError('Gagal memuat data') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [cfg.endpoint])

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
      await fetch(`${cfg.endpoint}/${id}`, { method: 'DELETE', headers: auth() })
      setDeleteId(null); setToast('Berhasil dihapus'); setTimeout(() => setToast(''), 2500); load()
    }
    catch { setError('Gagal menghapus') }
  }

  // Heuristic #2: Match between system and real world (auto currency/date format)
  const formatCell = (c: ColumnDef, item: any) => {
    if (c.render) return c.render(item)
    const val = item[c.id]
    if (typeof val === 'number' && /harga|amount|total|budget|fee|biaya/i.test(c.label || c.id)) {
      return `Rp ${val.toLocaleString('id-ID')}`
    }
    return val !== null && val !== undefined ? String(val) : '-'
  }

  const filtered = Array.isArray(items)
    ? items.filter((it: any) => cfg.columns.some((c: ColumnDef) => {
        const v = c.render ? c.render(it) : it[c.id]
        return String(v ?? '').toLowerCase().includes(q.trim().toLowerCase())
      }))
    : []

  return (
    <div className="max-w-6xl mx-auto admin-page">
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/admin" className="hover:text-brand-primary">Admin</Link><span>/</span><span className="text-text-main">{cfg.title}</span>
      </nav>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-display font-bold text-text-main">{cfg.title}</h1>
        <button onClick={() => navigate(`/admin/${cfg.resource}/new`)} className="btn-primary text-sm py-2 px-4 active:scale-[0.98] transition-transform">Tambah</button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {toast && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{toast}</div>}

      {/* Filter bar — Nielsen #6: find rows fast without leaving the page */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
          </span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={`Cari ${cfg.title.toLowerCase()}...`}
            className="form-input pl-9"
            aria-label={`Cari ${cfg.title}`}
          />
        </div>
        <span className="text-sm text-text-muted shrink-0">{filtered.length} data</span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-compact">
            <thead><tr className="border-b border-border-minimal bg-canvas-overlay/60 sticky top-0 z-10">
              {cfg.columns.map((c: ColumnDef) => <th key={c.id}>{c.label}</th>)}
              <th className="text-right">Aksi</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border-minimal">{cfg.columns.map((_: any, ci: number) => <td key={ci}><div className="w-full h-4 bg-gray-100 rounded animate-pulse" /></td>)}<td /></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={cfg.columns.length + 1} className="px-3 py-12">
                  <div className="flex flex-col items-center text-center gap-2">
                    <p className="text-text-main font-medium">{q ? 'Tidak ada hasil.' : cfg.emptyRow}</p>
                    {!q && <button onClick={() => navigate(`/admin/${cfg.resource}/new`)} className="btn-primary text-sm py-2 px-4 active:scale-[0.98] transition-transform mt-1">Tambah {cfg.title}</button>}
                  </div>
                </td></tr>
              ) : filtered.map((item: any) => (
                <tr key={item.id} className="border-b border-border-minimal hover:bg-canvas-light transition-colors">
                  {cfg.columns.map((c: ColumnDef) => <td key={c.id}>{formatCell(c, item)}</td>)}
                  <td className="text-right whitespace-nowrap">
                    <button onClick={() => navigate(`/admin/${cfg.resource}/${item.id}/edit`)} className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm mr-3 active:scale-[0.98] transition-transform">Edit</button>
                    <button onClick={() => setDeleteId(item.id)} className="text-red-600 hover:text-red-700 font-medium text-sm active:scale-[0.98] transition-transform">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards — no horizontal scroll */}
      <div className="md:hidden space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />) :
          filtered.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-12">
              <p className="text-text-main font-medium">{q ? 'Tidak ada hasil.' : cfg.emptyRow}</p>
              {!q && <button onClick={() => navigate(`/admin/${cfg.resource}/new`)} className="btn-primary text-sm py-2 px-4 active:scale-[0.98] transition-transform mt-1">Tambah {cfg.title}</button>}
            </div>
          ) :
          filtered.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-4">
              {cfg.columns.filter((c: ColumnDef) => c.id !== 'id').map((c: ColumnDef) => (
                <div key={c.id} className="flex justify-between gap-3 py-1 text-sm">
                  <span className="text-text-muted shrink-0">{c.label}</span>
                  <span className="text-text-main text-right font-medium">{formatCell(c, item)}</span>
                </div>
              ))}
              <div className="flex gap-3 pt-3 mt-2 border-t border-border-minimal">
                <button onClick={() => navigate(`/admin/${cfg.resource}/${item.id}/edit`)} className="text-brand-primary font-medium text-sm active:scale-[0.98] transition-transform">Edit</button>
                <button onClick={() => setDeleteId(item.id)} className="text-red-600 font-medium text-sm active:scale-[0.98] transition-transform">Hapus</button>
              </div>
            </div>
          ))}
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-display font-bold text-text-main text-lg mb-2">Konfirmasi Hapus</h3>
            <p className="text-text-muted text-sm mb-6">Apakah Anda yakin? Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-red-700 flex-1 active:scale-[0.98] transition-transform">Hapus</button>
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

  useEffect(() => {
    if (!id) {
      const init: Record<string, any> = {}
      cfg.formFields.forEach((f: FieldDef) => { if (f.type === 'select' && f.options?.length) init[f.name] = f.options[0].value })
      setForm(init); return
    }
    // No GET-by-ID endpoint exists; load list and pick the row. ponytail: fine for admin volumes.
    fetch(cfg.endpoint, { headers: auth() }).then(r => r.json()).then((rows: any[]) => {
      const row = (rows || []).find((x: any) => String(x.id) === String(id)) || {}
      const init = { ...row }
      cfg.formFields.forEach((f: FieldDef) => { if (f.type === 'select') { init[f.name] = row[f.name] === true ? '1' : row[f.name] === false ? '0' : row[f.name] } })
      setForm(init)
    }).catch(() => setError('Gagal memuat data'))
  }, [cfg, id])

  const validate = () => {
    const errs: Record<string, string> = {}
    cfg.formFields.forEach((f: FieldDef) => {
      const v = form[f.name]
      if (f.required && (!v || String(v).trim() === '')) errs[f.name] = 'Wajib diisi'
    })
    setFieldErrors(errs); return Object.keys(errs).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); if (!validate()) return
    setBusy(true)
    const payload = { ...form }
    cfg.formFields.forEach((f: FieldDef) => { if (f.type === 'select') { payload[f.name] = payload[f.name] === '1' || payload[f.name] === true } })
    try {
      if (id) await fetch(`${cfg.endpoint}/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(payload) })
      else await fetch(cfg.endpoint, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })
      onDone()
    } catch { setError('Gagal menyimpan') } finally { setBusy(false) }
  }

  return (
    <div className="max-w-2xl mx-auto admin-page">
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/admin" className="hover:text-brand-primary">Admin</Link><span>/</span>
        <Link to={`/admin/${cfg.resource}`} className="hover:text-brand-primary">{cfg.title}</Link><span>/</span>
        <span className="text-text-main">{id ? 'Edit' : 'Tambah'}</span>
      </nav>
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6">
        <h1 className="text-xl font-display font-bold text-text-main mb-6">{id ? 'Edit' : 'Tambah'} {cfg.title}</h1>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
          {cfg.formFields.map((f: FieldDef) => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea className={`form-input ${fieldErrors[f.name] ? 'border-red-300' : ''}`} rows={f.rows || 3} value={form[f.name] || ''} onChange={e => { setForm({ ...form, [f.name]: e.target.value }); if (fieldErrors[f.name]) setFieldErrors({ ...fieldErrors, [f.name]: '' }) }} required={f.required} />
              ) : f.type === 'select' ? (
                <select className={`form-input ${fieldErrors[f.name] ? 'border-red-300' : ''}`} value={form[f.name] ?? ''} onChange={e => { setForm({ ...form, [f.name]: e.target.value }); if (fieldErrors[f.name]) setFieldErrors({ ...fieldErrors, [f.name]: '' }) }} required={f.required}>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input className={`form-input ${fieldErrors[f.name] ? 'border-red-300' : ''}`} type={f.type || 'text'} value={form[f.name] ?? ''} onChange={e => { setForm({ ...form, [f.name]: e.target.value }); if (fieldErrors[f.name]) setFieldErrors({ ...fieldErrors, [f.name]: '' }) }} required={f.required} />
              )}
              {fieldErrors[f.name] && <p className="text-red-600 text-xs mt-1">{fieldErrors[f.name]}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-2 md:col-span-2">
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">{busy ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" onClick={onDone} className="btn-secondary">Batal</button>
          </div>
        </form>
      </div>
    </div>
  )
}
