import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

const columns: Column<Service>[] = [
  { id: 'name', label: 'Nama' },
  { id: 'slug', label: 'Slug' },
  { id: 'short_desc', label: 'Deskripsi' },
  { id: 'is_active', label: 'Aktif', render: (row: any) => row.is_active ? 'Ya' : 'Tidak' },
]

const formFields: FormField[] = [
  { name: 'name', label: 'Nama Layanan', required: true },
  { name: 'slug', label: 'Slug', required: true },
  { name: 'short_desc', label: 'Deskripsi Singkat', required: true },
  { name: 'content', label: 'Konten', type: 'textarea', rows: 4 },
  { name: 'color', label: 'Warna', required: true },
  { name: 'icon', label: 'Icon' },
]

interface Service { id: number; name: string; slug: string; short_desc: string; content?: string; color: string; icon?: string; is_active?: boolean }

export default function AdminServicesPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })

  return (
    <AdminCrudPage<Service>
      title="Layanan"
      breadcrumb="Layanan"
      columns={columns}
      fetch={() => apiGet('/api/services')}
      create={(data) => fetch('/api/services', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/services/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/services/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada layanan."
    />
  )
}
