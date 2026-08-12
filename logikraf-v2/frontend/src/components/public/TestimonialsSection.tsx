import { useEffect, useState } from 'react'

interface Testimonial {
  id: number
  name: string
  company?: string
  role?: string
  content: string
}

export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([])

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map((t: Record<string, unknown>) => ({
          id: t.id as number,
          name: (t.client_name as string) || '',
          company: t.company as string | undefined,
          role: t.position as string | undefined,
          content: t.content as string,
        }))
        setItems(mapped)
      })
  }, [])

  return (
    <section className="py-20 bg-canvas-light">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <span className="badge-primary mb-4 inline-block">Testimoni</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main mb-6">Kata Mereka</h2>
          <p className="font-body text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">Kepercayaan klien adalah bukti kualitas kerja kami.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(t => (
            <div key={t.id} className="card p-5">
              <p className="text-sm text-text-muted leading-relaxed">"{t.content}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-text-main">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role ? t.role : t.company}</p>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center text-text-muted py-12">Belum ada testimoni.</div>
          )}
        </div>
      </div>
    </section>
  )
}
