import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Portfolio {
  id: number
  title: string
  slug: string
  excerpt: string
  description: string
  thumbnail: string
  client_name: string
}

export default function PortfolioDetailPage() {
  const { slug } = useParams()
  const [item, setItem] = useState<Portfolio | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/portfolios')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((items: Portfolio[]) => items.find((p) => p.slug === slug) || Promise.reject('Portfolio tidak ditemukan'))
      .then(setItem)
      .catch((e) => setError(e))
  }, [slug])

  if (error) return (
    <PublicLayout>
      <div className="container-narrow pt-28 md:pt-32 pb-20">
        <div className="alert-error">{error}</div>
        <Link to="/" className="mt-4 inline-block text-sm text-brand-primary">← Kembali ke beranda</Link>
      </div>
    </PublicLayout>
  )
  if (!item) return (
    <PublicLayout>
      <div className="container-narrow pt-28 md:pt-32 pb-20"><div className="card animate-pulse h-64" /></div>
    </PublicLayout>
  )

  return (
    <PublicLayout>
      <section className="container-narrow pt-28 md:pt-32 pb-16 md:pb-20">
        <Link to="/" className="text-sm font-medium mb-4 inline-flex items-center gap-1 text-brand-primary hover:gap-2 transition-all">← Kembali</Link>
        <div className="card overflow-hidden">
          {item.thumbnail && (
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5 md:p-8">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{item.title}</h1>
            {item.client_name && <p className="mt-2 text-sm text-text-muted">Klien: {item.client_name}</p>}
            <p className="mt-4 text-text-muted leading-relaxed whitespace-pre-line">{item.description || item.excerpt}</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
