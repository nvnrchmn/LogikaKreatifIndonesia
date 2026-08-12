import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function ClientProfilePage() {
  const { name } = useAuth()
  const [form, setForm] = useState({
    name: name || localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    company: localStorage.getItem('company') || '',
    phone: localStorage.getItem('phone') || '',
  })
  const [saved, setSaved] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value })
    setSaved(false)
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    // ponytail: no client-self endpoint yet, persist locally; swap to PUT /api/clients/:id when auth carries client id
    localStorage.setItem('name', form.name)
    localStorage.setItem('email', form.email)
    localStorage.setItem('company', form.company)
    localStorage.setItem('phone', form.phone)
    setSaved(true)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-extrabold text-text-main mb-6">Profil</h1>

      {saved && <div className="alert-success mb-4">Profil berhasil disimpan.</div>}

      <form onSubmit={save} className="card p-6 space-y-5">
        <div>
          <label className="label">Nama</label>
          <input className="form-input" value={form.name} onChange={set('name')} placeholder="Nama lengkap" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="email@perusahaan.com" />
        </div>
        <div>
          <label className="label">Perusahaan</label>
          <input className="form-input" value={form.company} onChange={set('company')} placeholder="Nama perusahaan" />
        </div>
        <div>
          <label className="label">Telepon</label>
          <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="08xx-xxxx-xxxx" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Simpan</button>
        </div>
      </form>
    </div>
  )
}
