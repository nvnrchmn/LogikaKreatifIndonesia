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
    localStorage.setItem('name', form.name)
    localStorage.setItem('email', form.email)
    localStorage.setItem('company', form.company)
    localStorage.setItem('phone', form.phone)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const clientInitial = (form.name || 'K').charAt(0).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Profil Akun Klien</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Kelola informasi identitas perusahaan dan kontak PIC untuk faktur invoice dan koordinasi proyek.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>Perubahan profil berhasil disimpan!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8 space-y-6">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-border-minimal">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-display font-extrabold text-xl shadow-md shadow-brand-primary/20">
            {clientInitial}
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-text-main">
              {form.name || 'Akun Klien'}
            </h3>
            <p className="text-xs text-text-muted font-mono">{form.email || 'Email belum diatur'}</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600">
              ● Akun Terdaftar Logikraf
            </span>
          </div>
        </div>

        <form onSubmit={save} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-text-main mb-1.5 block">
                Nama Lengkap PIC *
              </label>
              <input
                className="form-input text-xs sm:text-sm"
                value={form.name}
                onChange={set('name')}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-main mb-1.5 block">
                Email Korespondensi *
              </label>
              <input
                className="form-input text-xs sm:text-sm"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="nama@perusahaan.com"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-main mb-1.5 block">
                Nama Perusahaan / Instansi
              </label>
              <input
                className="form-input text-xs sm:text-sm"
                value={form.company}
                onChange={set('company')}
                placeholder="PT. Sinergi Sukses Bersama"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-main mb-1.5 block">
                Nomor WhatsApp / Telepon
              </label>
              <input
                className="form-input text-xs sm:text-sm font-mono"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+62 812 3456 7890"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-minimal flex items-center justify-between">
            <span className="text-xs text-text-muted">
              🔒 Data Anda terlindungi oleh enkripsi SSL 256-bit.
            </span>
            <button
              type="submit"
              className="btn-primary text-xs py-2.5 px-6 shadow-sm active:scale-[0.98] transition-transform"
            >
              Simpan Profil 💾
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
