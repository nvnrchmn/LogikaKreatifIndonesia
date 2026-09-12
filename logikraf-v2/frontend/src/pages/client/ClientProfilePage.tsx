import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

// hdrs — header Authorization untuk API portal klien.
const hdrs = (json = false) => {
  const t = localStorage.getItem('token') || ''
  return json
    ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }
    : { Authorization: 'Bearer ' + t }
}

export default function ClientProfilePage() {
  const { name } = useAuth()
  const [form, setForm] = useState({
    name: name || localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    company: localStorage.getItem('company') || '',
    phone: localStorage.getItem('phone') || '',
  })
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Ambil data asli dari server (bukan localStorage) supaya tidak menyesatkan.
  useEffect(() => {
    fetch('/api/client/profile', { headers: hdrs() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, string> | null) => {
        if (!d) return
        setForm({ name: d.name || '', email: d.email || '', company: d.company || '', phone: d.phone || '' })
      })
      .catch(() => {})
  }, [])

  const [pw, setPw] = useState({ cur: '', next: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg('')
    setPwErr('')
    const res = await fetch('/api/client/password', {
      method: 'PUT',
      headers: hdrs(true),
      body: JSON.stringify({ current_password: pw.cur, new_password: pw.next }),
    }).catch(() => null)
    const d = (res ? await res.json().catch(() => ({})) : {}) as { error?: string }
    if (res && res.ok) {
      setPwMsg('Kata sandi berhasil diubah.')
      setPw({ cur: '', next: '' })
    } else {
      setPwErr(d.error || 'Gagal mengubah kata sandi.')
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value })
    setSaved(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('name', form.name)
    const res = await fetch('/api/client/profile', {
      method: 'PUT',
      headers: hdrs(true),
      body: JSON.stringify({ name: form.name, company: form.company, phone: form.phone }),
    }).catch(() => null)
    setSaveError(res && res.ok ? '' : 'Gagal menyimpan perubahan. Coba lagi.')
    setSaved(!!(res && res.ok))
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

      {saveError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
          {saveError}
        </div>
      )}

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

      {/* Keamanan akun: ganti kata sandi */}
      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8 space-y-5">
        <div>
          <h3 className="font-display font-bold text-base text-text-main">Keamanan Akun</h3>
          <p className="text-xs text-text-muted mt-0.5">Ganti kata sandi portal Anda kapan saja.</p>
        </div>
        {pwMsg && <p className="text-xs font-bold text-emerald-700">{pwMsg}</p>}
        {pwErr && <p className="text-xs font-bold text-red-600">{pwErr}</p>}
        <form onSubmit={changePw} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input className="form-input text-xs sm:text-sm" type="password" placeholder="Kata sandi saat ini" value={pw.cur} onChange={(e) => setPw({ cur: e.target.value, next: pw.next })} required />
          <input className="form-input text-xs sm:text-sm" type="password" placeholder="Kata sandi baru (min. 8)" value={pw.next} onChange={(e) => setPw({ cur: pw.cur, next: e.target.value })} required />
          <button className="btn-primary text-xs py-2.5 px-6" type="submit">Ganti Kata Sandi</button>
        </form>
      </div>
    </div>
  )
}
