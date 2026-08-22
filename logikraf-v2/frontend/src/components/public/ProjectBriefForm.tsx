import { useState } from 'react'

export default function ProjectBriefForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      .then(r => {
        if (r.ok) {
          setSent(true)
        } else {
          setError('Gagal mengirim pesan. Silakan coba lagi.')
        }
      })
      .catch(() => setError('Gagal mengirim pesan. Periksa koneksi Anda.'))
      .finally(() => setSubmitting(false))
  }

  const reset = () => {
    setForm({ name: '', email: '', message: '' })
    setError('')
    setSent(false)
  }

  return (
    <section id="konsultasi" className="section-padding bg-canvas-light">
      <div className="container-narrow">
        <div className="max-w-3xl mx-auto card p-8">
          <div className="text-center mb-8">
            <span className="badge badge-info mb-4 inline-block">Konsultasi</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-main mb-4">Mulai Proyek Anda</h2>
            <p className="font-body text-text-muted">Ceritakan kebutuhan Anda, tim kami akan menghubungi dalam 1x24 jam.</p>
          </div>
          {sent ? (
            <div className="alert-success text-center">
              <p className="font-medium">Pesan terkirim!</p>
              <p className="text-sm mt-1">Tim kami akan merespon dalam 1x24 jam.</p>
              <button type="button" onClick={reset} className="mt-4 text-sm font-semibold text-brand-primary hover:underline">Kirim pesan lain →</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="brief-name" className="label">Nama</label>
                <input id="brief-name" className="input" placeholder="Nama lengkap Anda" aria-label="Nama lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="brief-email" className="label">Email</label>
                <input id="brief-email" className="input" type="email" placeholder="email@contoh.com" aria-label="Alamat email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="brief-message" className="label">Kebutuhan Proyek</label>
                <textarea id="brief-message" className="input" rows={4} placeholder="Ceritakan kebutuhan proyek Anda..." aria-label="Pesan atau kebutuhan proyek" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>
              {error && <div className="alert-error">{error}</div>}
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
