import { useEffect, useState } from 'react'

export default function usePageMeta() {
  const [meta, setMeta] = useState({ title: '', description: '' })

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const title = data.company_name ? `${data.company_name} — Digital Creative Agency & Software House` : 'Logika Kreatif Indonesia'
        const description = 'PT. Logika Kreatif Indonesia — Agensi kreatif digital & software house.'
        setMeta({ title, description })
        document.title = title
        const desc = document.querySelector('meta[name="description"]')
        if (desc) desc.setAttribute('content', description)
        const og = document.querySelector('meta[property="og:title"]')
        if (og) og.setAttribute('content', title)
      })
  }, [])

  return meta
}
