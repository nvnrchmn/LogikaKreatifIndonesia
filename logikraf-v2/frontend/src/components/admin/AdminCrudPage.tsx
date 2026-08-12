import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export interface Column<T> {
  id: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

export interface FormField {
  name: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select'
  required?: boolean
  multiline?: boolean
  rows?: number
  options?: { value: string; label: string }[]
  minLength?: number
  min?: number
  pattern?: string
}

interface CrudPageProps<T extends { id: number }> {
  title: string
  breadcrumb: string
  columns: Column<T>[]
  fetch: () => Promise<T[]>
  create: (data: Record<string, any>) => Promise<T>
  update: (id: number, data: Record<string, any>) => Promise<T>
  remove: (id: number) => Promise<void>
  formFields: FormField[]
  emptyRow: string
}

export default function AdminCrudPage<T extends { id: number }>({
  title,
  breadcrumb,
  columns,
  fetch,
  create,
  update,
  remove,
  formFields,
  emptyRow,
}: CrudPageProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try { setItems(await fetch()) }
    catch { setError('Gagal memuat data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    const init: Record<string, any> = {}
    formFields.forEach(f => {
      if (f.type === 'select' && f.options && f.options.length) init[f.name] = f.options[0].value
    })
    setForm(init)
    setShowForm(true)
    setError('')
    setFieldErrors({})
  }

  const openEdit = (row: T) => {
    setEditing(row)
    const init: Record<string, any> = { ...(row as any) }
    formFields.forEach(f => {
      if (f.type === 'select') {
        if (init[f.name] === true) init[f.name] = '1'
        else if (init[f.name] === false) init[f.name] = '0'
      }
    })
    setForm(init)
    setShowForm(true)
    setError('')
    setFieldErrors({})
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    formFields.forEach(f => {
      const val = (form as any)[f.name]
      if (f.required && (!val || String(val).trim() === '')) errs[f.name] = 'Wajib diisi'
      if (f.minLength && String(val || '').length < f.minLength) errs[f.name] = `Minimal ${f.minLength} karakter`
      if (f.min !== undefined && Number(val) < f.min) errs[f.name] = `Minimal ${f.min}`
      if (f.pattern && !new RegExp(f.pattern).test(String(val || ''))) errs[f.name] = 'Format tidak valid'
    })
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    const payload: Record<string, any> = { ...form }
    formFields.forEach(f => {
      if (f.type === 'select') {
        if (payload[f.name] === '1') payload[f.name] = true
        else if (payload[f.name] === '0') payload[f.name] = false
      }
    })
    try {
      if (editing) {
        await update((editing as any).id, payload)
      } else {
        await create(payload)
      }
      setShowForm(false)
      load()
    } catch {
      setError('Gagal menyimpan')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await remove(id)
      setDeleteId(null)
      load()
    } catch {
      setError('Gagal menghapus')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/admin" className="hover:text-brand-primary">Admin</Link>
        <span>/</span>
        <span className="text-text-main">{breadcrumb}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-extrabold text-text-main">{title}</h1>
        {!showForm && (
          <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">Tambah</button>
        )}
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-minimal">
            <h2 className="font-display font-bold text-text-main">{editing ? 'Edit' : 'Tambah'} {title}</h2>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-main text-sm">Tutup</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {formFields.map(field => (
              <div key={field.name}>
                <label className="label">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    className={`form-input ${fieldErrors[field.name] ? 'border-red-300 focus:border-red-500' : ''}`}
                    rows={field.rows || 3}
                    value={(form as any)[field.name] || ''}
                    onChange={e => { setForm({ ...form, [field.name]: e.target.value }); if (fieldErrors[field.name]) setFieldErrors({ ...fieldErrors, [field.name]: '' }) }}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    className={`form-input ${fieldErrors[field.name] ? 'border-red-300 focus:border-red-500' : ''}`}
                    value={(form as any)[field.name] || ''}
                    onChange={e => { setForm({ ...form, [field.name]: e.target.value }); if (fieldErrors[field.name]) setFieldErrors({ ...fieldErrors, [field.name]: '' }) }}
                    required={field.required}
                  >
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`form-input ${fieldErrors[field.name] ? 'border-red-300 focus:border-red-500' : ''}`}
                    type={field.type || 'text'}
                    value={(form as any)[field.name] || ''}
                    onChange={e => { setForm({ ...form, [field.name]: e.target.value }); if (fieldErrors[field.name]) setFieldErrors({ ...fieldErrors, [field.name]: '' }) }}
                    required={field.required}
                  />
                )}
                {fieldErrors[field.name] && <p className="text-red-600 text-xs mt-1">{fieldErrors[field.name]}</p>}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-minimal">
                {columns.map(col => (
                  <th key={String(col.id)} className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">{col.label}</th>
                ))}
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border-minimal">
                    {columns.map((_, ci) => (
                      <td key={ci} className="px-4 py-3"><div className="w-full h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                    <td />
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-text-muted">{emptyRow}</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b border-border-minimal hover:bg-canvas-light transition-colors">
                    {columns.map(col => (
                      <td key={String(col.id)} className="px-4 py-3 text-text-main">
                        {col.render ? col.render(item) : (item as any)[col.id as string]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(item)} className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm mr-3">Edit</button>
                      <button onClick={() => setDeleteId(item.id)} className="text-red-600 hover:text-red-700 font-medium text-sm">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-display font-bold text-text-main text-lg mb-2">Konfirmasi Hapus</h3>
            <p className="text-text-muted text-sm mb-6">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-red-700 transition-colors flex-1">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
