import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Testimonial {
  id: number
  name: string
  role?: string
  content: string
  avatar?: string
  is_approved: boolean
  sort_order: number
}

const columns: Column<Testimonial>[] = [
  { id: 'name', label: 'Nama' },
  { id: 'role', label: 'Role', render: (r: any) => r.role || '-' },
  { id: 'content', label: 'Testimonial', render: (r: any) => (r.content || '').slice(0, 60) + '...' },
  { id: 'is_approved', label: 'Approved', render: (r: any) => r.is_approved ? 'Ya' : 'Tidak' },
]

const formFields: FormField[] = [
  { name: 'name', label: 'Nama Klien', required: true },
  { name: 'role', label: 'Role / Posisi' },
  { name: 'content', label: 'Testimonial', type: 'textarea', rows: 4, required: true },
  { name: 'avatar', label: 'URL Avatar' },
  { name: 'sort_order', label: 'Urutan', type: 'number' },
  { name: 'is_approved', label: 'Approved', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
]

export default function AdminTestimonialsPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Testimonial>
      title="Testimonials"
      breadcrumb="Testimonials"
      columns={columns}
      fetch={() => apiGet('/api/testimonials')}
      create={(data) => fetch('/api/testimonials', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/testimonials/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada testimonial."
    />
  )
}
