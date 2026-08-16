import { useEffect, useState } from 'react'
import { fetchSite, SiteData } from './api'

function parseJSON(s: string, fallback: any = {}) {
  try { return JSON.parse(s || '{}') } catch { return fallback }
}

function SectionView({ section }: { section: any }) {
  const c = parseJSON(section.content_json)
  switch (section.type) {
    case 'hero':
      return (
        <section className="py-20 text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{c.heading}</h1>
          <p className="text-lg text-slate-600 mb-6">{c.subheading}</p>
          {c.cta && <a href={c.cta_url || '#'} className="inline-block px-6 py-3 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700">{c.cta}</a>}
        </section>
      )
    case 'text':
      return (
        <section className="py-10 px-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">{c.heading}</h2>
          <p className="text-slate-600 leading-relaxed">{c.body}</p>
        </section>
      )
    case 'gallery':
      return (
        <section className="py-10 px-4">
          <h2 className="text-2xl font-bold mb-4 text-center">{c.heading}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {(c.images || []).map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="rounded-xl aspect-square object-cover" />
            ))}
          </div>
        </section>
      )
    case 'contact':
      return (
        <section className="py-10 px-4 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Kontak</h2>
          <p className="text-slate-600">{c.address}</p>
          <p className="text-slate-600">{c.phone}</p>
          <a href={`https://wa.me/${c.whatsapp || ''}`} className="inline-block mt-3 px-5 py-2 rounded-xl bg-green-600 text-white font-semibold">WhatsApp</a>
        </section>
      )
    default:
      return null
  }
}

export default function App() {
  const [data, setData] = useState<SiteData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSite().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>
  if (!data || !data.tenant) return <div className="p-8 text-center text-slate-500">Memuat...</div>

  const t = data.tenant
  const theme = parseJSON(t.theme_json)
  const primary = theme.primary || '#2563eb'

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="border-b sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {t.logo_url ? (
            <img src={t.logo_url} alt={t.business_name} className="h-9" />
          ) : (
            <span className="font-bold text-lg" style={{ color: primary }}>{t.business_name}</span>
          )}
          {t.whatsapp && (
            <a href={`https://wa.me/${t.whatsapp}`} className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: primary }}>WhatsApp</a>
          )}
        </div>
      </header>

      {data.pages.map((page) => (
        <div key={page.id}>
          {page.sections.map((s) => (
            <SectionView key={s.id} section={s} />
          ))}
        </div>
      ))}

      <footer className="border-t py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} {t.business_name} · Powered by Logikraf
      </footer>
    </div>
  )
}
