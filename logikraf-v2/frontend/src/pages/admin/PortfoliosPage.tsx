import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Portfolio {
  id: number
  title: string
  slug: string
  client_name?: string
  excerpt?: string
  content?: string
  cover_image?: string
  is_published: boolean
}

const columns: Column<Portfolio>[] = [
  { id: 'title', label: 'Judul' },
  { id: 'slug', label: 'Slug' },
  { id: 'client_name', label: 'Klien', render: (row: any) => row.client_name || '-' },
  { id: 'is_published', label: 'Published', render: (row: any) => row.is_published ? 'Ya' : 'Tidak' },
]

const formFields: FormField[] = [
  { name: 'title', label: 'Judul', required: true },
  { name: 'slug', label: 'Slug', required: true },
  { name: 'client_name', label: 'Nama Klien' },
  { name: 'excerpt', label: 'Excerpt' },
  { name: 'description', label: 'Konten', type: 'textarea', rows: 4 },
  { name: 'thumbnail', label: 'URL Gambar' },
  { name: 'is_published', label: 'Published', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
]

export default function AdminPortfoliosPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Portfolio>
      title="Portofolio"
      breadcrumb="Portofolio"
      columns={columns}
      fetch={() => apiGet('/api/portfolios')}
      create={(data) => fetch('/api/portfolios', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/portfolios/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/portfolios/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada portofolio."
    />
  )
}
