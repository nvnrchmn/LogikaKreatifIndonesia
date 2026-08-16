export interface Section {
  id: number
  page_id: number
  type: string
  content_json: string
  sort_order: number
}

export interface Page {
  id: number
  tenant_id: number
  slug: string
  title: string
  meta_json: string
  published: boolean
  sort_order: number
  sections: Section[]
}

export interface Tenant {
  id: number
  slug: string
  business_name: string
  description: string
  logo_url: string
  whatsapp: string
  contact_email: string
  contact_phone: string
  address: string
  maps_embed: string
  theme_json: string
  seo_json: string
  social_json: string
}

export interface SiteData {
  tenant: Tenant | null
  pages: Page[]
}

export async function fetchSite(): Promise<SiteData> {
  const res = await fetch('/api/site')
  if (!res.ok) throw new Error('Failed to load site')
  return res.json()
}
