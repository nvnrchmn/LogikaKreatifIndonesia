import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Lead {
  id: number
  name: string
  email: string
  company?: string
  service_category?: string
  notes?: string
  status?: string
  lead_score: number
}

const columns: Column<Lead>[] = [
  { id: 'name', label: 'Nama' },
  { id: 'email', label: 'Email' },
  { id: 'company', label: 'Perusahaan', render: (r: any) => r.company || '-' },
  { id: 'service_category', label: 'Kategori', render: (r: any) => r.service_category || '-' },
  { id: 'status', label: 'Status', render: (r: any) => r.status || 'new' },
  { id: 'lead_score', label: 'Skor' },
]

const formFields: FormField[] = [
  { name: 'name', label: 'Nama', required: true },
  { name: 'email', label: 'Email', required: true },
  { name: 'company', label: 'Perusahaan' },
  { name: 'service_category', label: 'Kategori Layanan' },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'qualified', label: 'Qualified' }, { value: 'lost', label: 'Lost' }] },
  { name: 'lead_score', label: 'Lead Score', type: 'number', min: 0 },
  { name: 'notes', label: 'Catatan', type: 'textarea', rows: 3 },
]

export default function AdminLeadsPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Lead>
      title="Leads"
      breadcrumb="Leads"
      columns={columns}
      fetch={() => apiGet('/api/leads')}
      create={(data) => fetch('/api/leads', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/leads/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/leads/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada lead."
    />
  )
}
