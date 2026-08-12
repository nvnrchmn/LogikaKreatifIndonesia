import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Client {
  id: number
  company_name?: string
  pic_name?: string
  email?: string
  phone?: string
  city?: string
  address?: string
}

const columns: Column<Client>[] = [
  { id: 'company_name', label: 'Perusahaan', render: (row: any) => row.company_name || row.pic_name || '-' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'city', label: 'Kota' },
]

const formFields: FormField[] = [
  { name: 'company_name', label: 'Nama Perusahaan' },
  { name: 'pic_name', label: 'PIC', required: true },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' },
  { name: 'city', label: 'Kota' },
  { name: 'address', label: 'Alamat', type: 'textarea', rows: 2 },
]

export default function AdminClientsPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Client>
      title="Clients"
      breadcrumb="Clients"
      columns={columns}
      fetch={() => apiGet('/api/clients')}
      create={(data) => fetch('/api/clients', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/clients/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/clients/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada client."
    />
  )
}
