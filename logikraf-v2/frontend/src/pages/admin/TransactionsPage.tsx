import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Transaction {
  id: number
  order_id?: number
  transaction_reference?: string
  milestone_name?: string
  amount?: number
  payment_method?: string
  status?: string
}

const columns: Column<Transaction>[] = [
  { id: 'order_id', label: 'Order' },
  { id: 'transaction_reference', label: 'Referensi' },
  { id: 'milestone_name', label: 'Milestone' },
  { id: 'amount', label: 'Jumlah', render: (row: any) => `Rp ${Number(row.amount || 0).toLocaleString('id-ID')}` },
  { id: 'payment_method', label: 'Metode' },
  { id: 'status', label: 'Status', render: (row: any) => row.status || '-' },
]

const formFields: FormField[] = [
  { name: 'order_id', label: 'Order ID', type: 'number' },
  { name: 'transaction_reference', label: 'Referensi' },
  { name: 'milestone_name', label: 'Milestone' },
  { name: 'amount', label: 'Jumlah', type: 'number' },
  { name: 'payment_method', label: 'Metode Pembayaran' },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }] },
]

export default function AdminTransactionsPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Transaction>
      title="Transactions"
      breadcrumb="Transactions"
      columns={columns}
      fetch={() => apiGet('/api/transactions')}
      create={(data) => fetch('/api/transactions', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/transactions/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/transactions/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada transaksi."
    />
  )
}
