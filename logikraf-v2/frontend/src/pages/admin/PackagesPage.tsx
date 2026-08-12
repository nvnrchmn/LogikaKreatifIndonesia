import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface PackageItem {
  id: number
  name: string
  slug: string
  price: number
  tagline?: string
  features?: string
  is_featured: boolean
  is_active: boolean
}

const columns: Column<PackageItem>[] = [
  { id: 'name', label: 'Nama' },
  { id: 'slug', label: 'Slug' },
  { id: 'price', label: 'Harga', render: (row: any) => `Rp ${Number(row.price).toLocaleString('id-ID')}` },
  { id: 'is_featured', label: 'Featured', render: (row: any) => row.is_featured ? 'Ya' : 'Tidak' },
  { id: 'is_active', label: 'Aktif', render: (row: any) => row.is_active ? 'Ya' : 'Tidak' },
]

const formFields: FormField[] = [
  { name: 'name', label: 'Nama Paket', required: true },
  { name: 'slug', label: 'Slug', required: true },
  { name: 'tagline', label: 'Tagline' },
  { name: 'price', label: 'Harga', type: 'number', required: true, min: 0 },
  { name: 'strike_price', label: 'Harga Coret', type: 'number', min: 0 },
  { name: 'features', label: 'Fitur', type: 'textarea', rows: 4 },
  { name: 'is_featured', label: 'Featured', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
  { name: 'is_active', label: 'Aktif', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
]

export default function AdminPackagesPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<PackageItem>
      title="Paket Layanan"
      breadcrumb="Paket Layanan"
      columns={columns}
      fetch={() => apiGet('/api/packages')}
      create={(data) => fetch('/api/packages', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/packages/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/packages/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada paket."
    />
  )
}
