import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface Service {
  id: number
  name: string
  slug: string
  short_desc: string
  description: string
  category: string
  base_price: number
  color: string
}

const icons: Record<string, string> = {
  software: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>',
  uiux: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>',
  marketing: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
  branding: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>',
}

const iconFor = (service: Service) => {
  const map: Record<string, string> = {
    'software-development': 'software',
    'ui-ux-design': 'uiux',
    'digital-marketing': 'marketing',
    'branding': 'branding',
  }
  return icons[map[service.slug] || 'software'] || icons.software
}

const categoryLabel = (slug: string) => {
  const map: Record<string, string> = {
    'software-development': 'Software Development',
    'ui-ux-design': 'UI/UX Design',
    'digital-marketing': 'Digital Marketing',
    'branding': 'Branding',
  }
  return map[slug] || slug
}

const fallbackServices: Service[] = [
  { id: 1, name: 'Software Development', slug: 'software-development', short_desc: 'Pembuatan perangkat lunak khusus.', description: '', category: 'software', base_price: 5000000, color: '#0052FF' },
  { id: 2, name: 'UI/UX Design', slug: 'ui-ux-design', short_desc: 'Desain antarmuka yang memukau.', description: '', category: 'uiux', base_price: 3000000, color: '#FF3B30' },
  { id: 3, name: 'Digital Marketing', slug: 'digital-marketing', short_desc: 'Strategi pemasaran berbasis data.', description: '', category: 'marketing', base_price: 2000000, color: '#34C759' },
  { id: 4, name: 'Branding', slug: 'branding', short_desc: 'Identitas merek yang kuat.', description: '', category: 'branding', base_price: 2500000, color: '#FF9500' },
]

export default function ServiceShowcase() {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setServices(data.length ? data : fallbackServices))
  }, [])

  return (
    <section id="layanan" className="section-padding bg-canvas-light">
      <div className="container-narrow">
        <div className="text-center mb-16 lg:mb-20">
          <span className="badge-primary mb-4 inline-block">Layanan Kami</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main mb-6">
            Solusi Digital yang <span className="text-brand-primary">Komprehensif</span>
          </h2>
          <p className="font-body text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Empat pilar keahlian yang saling melengkapi untuk menghadirkan produk digital yang berdampak bagi bisnis Anda.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service) => (
            <Link key={service.id} to={`/layanan/${service.slug}`} className="card-hover group block no-underline text-text-main">
              <div className="p-8 lg:p-10">
                <div className="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-brand-primary group-hover:scale-110">
                  <span className="w-7 h-7 text-brand-primary transition-colors duration-300 group-hover:text-white" dangerouslySetInnerHTML={{ __html: iconFor(service) }} />
                </div>
                <span className="badge-primary text-[10px] uppercase tracking-widest mb-4 inline-block">{categoryLabel(service.slug)}</span>
                <h3 className="font-display text-xl lg:text-2xl font-bold text-text-main mb-3 group-hover:text-brand-primary transition-colors duration-200">{service.name}</h3>
                <p className="font-body text-sm text-text-muted leading-relaxed mb-6">{service.short_desc}</p>
                {service.base_price > 0 && (
                  <div className="pt-6 border-t border-border-minimal">
                    <span className="font-body text-xs text-text-muted">Mulai dari</span>
                    <span className="font-display text-lg font-bold text-text-main ml-2">Rp {Number(service.base_price).toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
