import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface OrderTask {
  id: number
  order_id?: number
  title?: string
  description?: string
  status?: string
  position?: number
}

const columns: Column<OrderTask>[] = [
  { id: 'order_id', label: 'Order' },
  { id: 'title', label: 'Judul' },
  { id: 'status', label: 'Status', render: (row: any) => row.status || '-' },
  { id: 'position', label: 'Posisi', render: (row: any) => row.position || 0 },
]

const formFields: FormField[] = [
  { name: 'order_id', label: 'Order ID', type: 'number', required: true },
  { name: 'title', label: 'Judul', required: true },
  { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'todo', label: 'To Do' }, { value: 'in_progress', label: 'In Progress' }, { value: 'done', label: 'Done' }, { value: 'blocked', label: 'Blocked' }] },
  { name: 'position', label: 'Posisi', type: 'number' },
]

export default function AdminTimeTrackingPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<OrderTask>
      title="Time Tracking"
      breadcrumb="Time Tracking"
      columns={columns}
      fetch={() => apiGet('/api/order-tasks')}
      create={(data) => fetch('/api/order-tasks', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/order-tasks/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/order-tasks/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada task."
    />
  )
}
