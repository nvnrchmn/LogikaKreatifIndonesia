import { useEffect, type ReactNode } from 'react'

// ClientPortalGate — bila admin mengisi "URL Portal Klien" (mis. https://client.logikraf.id),
// semua halaman /client/* di domain utama dialihkan ke subdomain itu.
// Kosong = perilaku lama (portal tetap di domain utama).
export default function ClientPortalGate({ children }: { children?: ReactNode }) {
  useEffect(() => {
    fetch('/api/settings/public')
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: Record<string, string>) => {
        const base = (d.company_client_portal_url || '').replace(/\/+$/, '')
        if (!base) return
        try {
          const target = new URL(base)
          const clean = window.location.pathname.replace(/^\/client/, '') || '/login'
          if (target.host !== window.location.host) {
            window.location.replace(base + clean + window.location.search)
            return
          }
          if (window.location.pathname.startsWith('/client/')) {
            window.location.replace(clean + window.location.search)
          }
        } catch {
          // URL belum valid — jangan alihkan
        }
      })
      .catch(() => {})
  }, [])
  return <>{children}</>
}
