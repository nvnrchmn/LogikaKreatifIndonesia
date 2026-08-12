import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Ticket {
  id: number
  subject: string
  priority?: string
  status?: string
}

const columns: Column<Ticket>[] = [
  { id: 'subject', label: 'Subject' },
  { id: 'priority', label: 'Priority', render: (r: any) => r.priority || 'medium' },
  { id: 'status', label: 'Status', render: (r: any) => r.status || 'open' },
]

const formFields: FormField[] = [
  { name: 'subject', label: 'Subject', required: true },
  { name: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'pending', label: 'Pending' }, { value: 'closed', label: 'Closed' }] },
]

export default function AdminTicketsPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Ticket>
      title="Tickets"
      breadcrumb="Tickets"
      columns={columns}
      fetch={() => apiGet('/api/tickets')}
      create={(data) => fetch('/api/tickets', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/tickets/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/tickets/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada ticket."
    />
  )
}
