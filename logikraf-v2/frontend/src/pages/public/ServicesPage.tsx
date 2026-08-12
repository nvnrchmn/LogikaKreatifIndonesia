import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Service {
  id: number
  name: string
  slug: string
  short_desc: string
  color: string
}

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => setError('Gagal memuat layanan'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <section className="container-narrow pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Layanan</h1>
          <p className="mt-3 text-text-muted max-w-xl mx-auto">Solusi digital end-to-end untuk bisnis modern.</p>
        </div>

        {error && <div className="alert-error max-w-3xl mx-auto">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map(s => (
              <Link key={s.id} to="/kontak" className="card-hover group block" style={{ borderTop: `4px solid ${s.color}` }}>
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <img src="/logo.png" alt="Logikraf" className="h-10 w-10 object-contain" />
                    <h3 className="font-bold leading-tight">{s.name}</h3>
                  </div>
                  <p className="text-sm text-text-muted line-clamp-3 flex-1">{s.short_desc}</p>
                  <span className="mt-4 text-xs font-semibold tracking-wide uppercase text-brand-primary group-hover:underline">Konsultasikan →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  )
}
