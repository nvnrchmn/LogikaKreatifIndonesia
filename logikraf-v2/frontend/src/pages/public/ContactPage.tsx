import { useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface FormState { name: string; email: string; message: string }
type Errors = Partial<Record<keyof FormState, string>>

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const update = (key: keyof FormState, value: string) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (form.name.trim().length < 2) e.name = 'Nama lengkap wajib diisi (min. 2 karakter).'
    if (!emailRe.test(form.email.trim())) e.email = 'Masukkan alamat email yang valid.'
    if (form.message.trim().length < 10) e.message = 'Pesan wajib diisi (min. 10 karakter).'
    return e
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length === 0) setSent(true)
  }

  const reset = () => {
    setForm({ name: '', email: '', message: '' })
    setErrors({})
    setSent(false)
  }

  const field = (key: keyof FormState) =>
    `input ${errors[key] ? 'form-input-error' : ''}`

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h1 className="text-4xl font-display font-bold text-text-main mb-4">Mari Berkolaborasi</h1>
              <p className="text-text-muted text-sm leading-relaxed">Punya proyek digital impian, atau pertanyaan terkait layanan SaaS kami? Jangan ragu untuk menghubungi tim ahli Logikraf.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-brand-primary rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                <h3 className="font-display font-bold text-2xl mb-8">Informasi Kontak</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Email Dukungan</h4>
                      <p className="text-white/70 text-sm">hello@logikraf.id</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Telepon & WhatsApp</h4>
                      <p className="text-white/70 text-sm">+62 811-1234-5678</p>
                      <p className="text-white/70 text-sm">Senin - Jumat, 09:00 - 17:00 WIB</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Kantor Pusat</h4>
                      <p className="text-white/70 text-sm">Gedung Inovasi Lt. 3, Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta, 12190</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 md:p-12 border border-border-minimal shadow-sm">
                <h3 className="font-display font-bold text-2xl text-text-main mb-6">Kirim Pesan</h3>
                {sent ? (
                  <div className="alert-success">
                    <p className="font-medium">Pesan berhasil dikirim.</p>
                    <p className="text-sm mt-1">Tim kami akan merespon dalam 1x24 jam.</p>
                    <button type="button" onClick={reset} className="mt-4 text-sm font-semibold text-brand-primary hover:underline">Kirim pesan lain →</button>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate className="space-y-5">
                    <div>
                      <label className="label">Nama Lengkap</label>
                      <input className={field('name')} placeholder="Nama Anda" value={form.name} onChange={e => update('name', e.target.value)} aria-invalid={!!errors.name} />
                      {errors.name && <p className="mt-1.5 text-xs text-status-danger">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input className={field('email')} type="email" placeholder="email@contoh.com" value={form.email} onChange={e => update('email', e.target.value)} aria-invalid={!!errors.email} />
                      {errors.email && <p className="mt-1.5 text-xs text-status-danger">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="label">Pesan</label>
                      <textarea className={`${field('message')} resize-none`} rows={5} placeholder="Ceritakan kebutuhan Anda..." value={form.message} onChange={e => update('message', e.target.value)} aria-invalid={!!errors.message} />
                      {errors.message && <p className="mt-1.5 text-xs text-status-danger">{errors.message}</p>}
                    </div>
                    <button type="submit" className="btn-primary w-full">Kirim Pesan</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
