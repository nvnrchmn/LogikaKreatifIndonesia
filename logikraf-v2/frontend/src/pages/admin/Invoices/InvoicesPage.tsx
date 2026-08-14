import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Table, Tag, Select } from 'antd'

interface InvoiceItem {
  id: string
  name: string
  qty: number
  price: number
  total: number
}

interface Invoice {
  id: string
  order_id: string
  business_id: string
  invoice_no: string
  issue_date: string
  due_date: string
  total_amount: number
  status: string
  pdf_path?: string
  items?: InvoiceItem[]
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    order_id: 'ord-001',
    business_id: 'biz-001',
    invoice_no: 'INV-ORD-001',
    issue_date: '2026-08-10',
    due_date: '2026-08-25',
    total_amount: 50000000,
    status: 'sent',
    items: [
      { id: 'i1', name: 'Bangunan Tinggal', qty: 1, price: 50000000, total: 50000000 }
    ]
  }
]

const statusColors: Record<string, string> = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState('')

  const { data: invoices = mockInvoices, isLoading } = useQuery(['invoices', statusFilter], () =>
    statusFilter 
      ? Promise.resolve(mockInvoices.filter(i => i.status === statusFilter))
      : Promise.resolve(mockInvoices)
  )

  const columns = [
    { title: 'No. Inv', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id' },
    { title: 'Tanggal', dataIndex: 'issue_date', key: 'issue_date' },
    { title: 'Jatuh Tempo', dataIndex: 'due_date', key: 'due_date' },
    { title: 'Total', dataIndex: 'total_amount', key: 'total_amount',
      render: (v: number) => `Rp ${v.toLocaleString('id-ID')}` },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
    { title: 'Action', key: 'action', render: () => <a>Unduh PDF</a> },
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>

      <div className="mb-4">
        <Select
          placeholder="Filter Status"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Terkirim' },
            { value: 'paid', label: 'Lunas' },
            { value: 'overdue', label: 'Tertunda' },
          ]}
        />
      </div>

      <Card>
        <Table 
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}