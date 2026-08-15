import { useState, useEffect } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface FormState {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

type Errors = Partial<Record<keyof FormState, string>>

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    service: 'Web Development',
    message: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => (r.ok ? r.json() : {}))
      .then(d => setSettings(d || {}))
      .catch(() => {})
  }, [])

  const contactWhatsapp = settings.contact_whatsapp || '+62 812-3456-7890'
  const contactEmail = settings.contact_email || 'support@logikraf.id'
  const contactHours = settings.contact_hours || 'Senin – Jumat, pukul 09:00 – 18:00 WIB'
  const contactAddress = settings.contact_address || 'Jakarta, DKI Jakarta, Indonesia'
  const companyName = settings.company_name || 'PT. Logika Kreatif Indonesia'
  const cleanWaNumber = contactWhatsapp.replace(/[^0-9]/g, '')

  const update = (key: keyof FormState, value: string) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (form.name.trim().length < 2) e.name = 'Nama lengkap wajib diisi.'
    if (!emailRe.test(form.email.trim())) e.email = 'Masukkan email yang valid.'
    if (form.phone.trim().length < 8) e.phone = 'Nomor WhatsApp / telepon wajib diisi.'
    if (form.message.trim().length < 10) e.message = 'Pesan atau kebutuhan proyek min. 10 karakter.'
    return e
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.service,
          notes: form.message,
        }),
      })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setForm({ name: '', email: '', phone: '', service: 'Web Development', message: '' })
    setErrors({})
    setSent(false)
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero Section */}
        <div className="pt-36 sm:pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Konsultasi &amp; Penawaran Proyek</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Mari Diskusikan Proyek <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">
                  Digital Impian Anda
                </span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Kirimkan rincian kebutuhan Anda atau hubungi kami langsung via WhatsApp untuk respon cepat dari technical consultant kami.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Contact Information Sidebar */}
              <div className="lg:col-span-5 bg-gradient-to-br from-canvas-dark via-gray-900 to-canvas-dark rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-accent block mb-2">Helpdesk Resmi</span>
                    <h3 className="font-display font-bold text-2xl text-white">Informasi Kontak</h3>
                    <p className="text-text-light/70 text-xs sm:text-sm mt-2 leading-relaxed">
                      Kami beroperasi {contactHours} untuk konsultasi teknis dan penanganan tiket klien.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Email Resmi</h4>
                        <p className="text-text-light/70 text-xs mt-0.5 font-mono">{contactEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">WhatsApp &amp; Telepon</h4>
                        <p className="text-text-light/70 text-xs mt-0.5 font-mono">{contactWhatsapp}</p>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400">● Tim Siap Merespon</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 text-brand-primary">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Kantor Pusat</h4>
                        <p className="text-text-light/70 text-xs mt-0.5 leading-relaxed">
                          {companyName}, {contactAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-8 mt-8 border-t border-white/10">
                  <a
                    href={`https://wa.me/${cleanWaNumber || '6281234567890'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg text-sm"
                  >
                    <span>💬 Hubungi via WhatsApp Instan</span>
                  </a>
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 border border-border-minimal shadow-sm">
                <h3 className="font-display font-bold text-2xl text-text-main mb-2">Kirim Pesan &amp; Brief Proyek</h3>
                <p className="text-text-muted text-xs sm:text-sm mb-8">Isi formulir di bawah ini, tim representatif kami akan menghubungi Anda dalam 1x24 jam.</p>

                {sent ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-3 animate-fade-in">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                    <h4 className="font-bold text-lg">Pesan Berhasil Terkirim!</h4>
                    <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                      Terima kasih telah menghubungi Logikraf. Tim kami akan segera meninjau kebutuhan proyek Anda dan membalas via Email / WhatsApp.
                    </p>
                    <button
                      type="button"
                      onClick={reset}
                      className="mt-4 inline-block text-xs font-bold text-emerald-800 underline hover:no-underline"
                    >
                      Kirim Pesan Lainnya →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-text-main mb-1.5 block">Nama Lengkap *</label>
                        <input
                          className={`form-input text-sm ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          placeholder="John Doe"
                          value={form.name}
                          onChange={e => update('name', e.target.value)}
                        />
                        {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-text-main mb-1.5 block">Email Aktif *</label>
                        <input
                          type="email"
                          className={`form-input text-sm ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          placeholder="nama@email.com"
                          value={form.email}
                          onChange={e => update('email', e.target.value)}
                        />
                        {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-text-main mb-1.5 block">WhatsApp / Telepon *</label>
                        <input
                          className={`form-input text-sm ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          placeholder="+62 812 3456 7890"
                          value={form.phone}
                          onChange={e => update('phone', e.target.value)}
                        />
                        {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-text-main mb-1.5 block">Kategori Layanan</label>
                        <select
                          className="form-input text-sm"
                          value={form.service}
                          onChange={e => update('service', e.target.value)}
                        >
                          <option value="Web Development">Web Development &amp; Custom Apps</option>
                          <option value="Paket Website UMKM">Paket Website UMKM Siap Pakai</option>
                          <option value="Mobile App Development">Mobile App (iOS &amp; Android)</option>
                          <option value="UI/UX Design">UI/UX Design &amp; Prototyping</option>
                          <option value="Digital Marketing & Branding">Digital Marketing &amp; Branding</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-main mb-1.5 block">Pesan / Rincian Kebutuhan Proyek *</label>
                      <textarea
                        className={`form-input text-sm resize-none ${errors.message ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        rows={4}
                        placeholder="Jelaskan gambaran proyek, target rilis, atau pertanyaan Anda..."
                        value={form.message}
                        onChange={e => update('message', e.target.value)}
                      />
                      {errors.message && <p className="text-[11px] text-red-600 mt-1">{errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary text-sm py-3.5 shadow-lg shadow-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Mengirimkan Pesan...' : 'Kirim Permintaan Konsultasi 🚀'}
                    </button>
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
