import { useState } from 'react'

export default function ProjectBriefForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      .then(r => {
        if (r.ok) {
          setSent(true)
        } else {
          setError('Gagal mengirim pesan. Silakan coba lagi.')
        }
      })
      .catch(() => setError('Gagal mengirim pesan. Periksa koneksi Anda.'))
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
            <span className="badge-primary mb-4">Konsultasi</span>
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
              <input className="input" placeholder="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <textarea className="input" rows={4} placeholder="Pesan / Kebutuhan proyek" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              {error && <div className="alert-error">{error}</div>}
              <button type="submit" className="btn-primary w-full">Kirim Pesan</button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
