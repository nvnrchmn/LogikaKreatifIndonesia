import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Order {
  id: number
  order_number?: string
  project_name: string
  total_amount: number
  status?: string
  milestone_status?: string
}

const columns: Column<Order>[] = [
  { id: 'order_number', label: 'Nomor', render: (r: any) => r.order_number || '-' },
  { id: 'project_name', label: 'Proyek' },
  { id: 'total_amount', label: 'Total', render: (r: any) => `Rp ${Number(r.total_amount || 0).toLocaleString('id-ID')}` },
  { id: 'status', label: 'Status', render: (r: any) => r.status || 'pending' },
  { id: 'milestone_status', label: 'Milestone', render: (r: any) => r.milestone_status || '-' },
]

const formFields: FormField[] = [
  { name: 'order_number', label: 'Nomor Order' },
  { name: 'project_name', label: 'Nama Proyek', required: true },
  { name: 'total_amount', label: 'Total Amount', type: 'number', required: true, min: 0 },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
  { name: 'milestone_status', label: 'Milestone Status' },
]

export default function AdminOrdersPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Order>
      title="Orders"
      breadcrumb="Orders"
      columns={columns}
      fetch={() => apiGet('/api/orders')}
      create={(data) => fetch('/api/orders', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/orders/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/orders/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada order."
    />
  )
}
