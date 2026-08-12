import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Invoice {
  id: number
  number: string
  type?: string
  amount?: number
  status?: string
  due_date?: string
  notes?: string
}

const columns: Column<Invoice>[] = [
  { id: 'number', label: 'Nomor' },
  { id: 'type', label: 'Tipe' },
  { id: 'amount', label: 'Jumlah', render: (row: any) => `Rp ${Number(row.amount || 0).toLocaleString('id-ID')}` },
  { id: 'status', label: 'Status', render: (row: any) => row.status || '-' },
  {
    id: 'id', label: 'PDF', render: (row: any) => (
      <button
        onClick={() => window.open(`/api/invoices/${row.id}/pdf`, '_blank', 'noopener')}
        className="rounded-lg bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary hover:bg-brand-primary/20"
      >
        Download PDF
      </button>
    )
  },
]

const formFields: FormField[] = [
  { name: 'number', label: 'Nomor Invoice', required: true },
  { name: 'type', label: 'Tipe' },
  { name: 'amount', label: 'Jumlah', type: 'number', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }] },
  { name: 'due_date', label: 'Due Date' },
  { name: 'notes', label: 'Catatan', type: 'textarea', rows: 3 },
]

export default function AdminInvoicesPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Invoice>
      title="Invoices"
      breadcrumb="Invoices"
      columns={columns}
      fetch={() => apiGet('/api/invoices')}
      create={(data) => fetch('/api/invoices', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/invoices/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/invoices/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada invoice."
    />
  )
}
