import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, Input, Button, Table, Tag, Select, message } from 'antd'

interface Order {
  id: string
  business_id: string
  service_id: string
  client_name: string
  client_email: string
  client_phone: string
  quote_amount: number
  final_amount: number
  status: string
  payment_gateway: string
  transaction_id?: string
  notes?: string
  created_at?: string
}

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    business_id: 'biz-001',
    service_id: 'svc-001',
    client_name: 'PT Maju Bersama',
    client_email: 'info@maju.com',
    client_phone: '+62 812-3456-7890',
    quote_amount: 50000000,
    final_amount: 50000000,
    status: 'completed',
    payment_gateway: 'midtrans',
    transaction_id: 'txn-123',
    notes: 'Pembayaran sudah lunas',
  }
]

const statusColors: Record<string, string> = {
  draft: 'default',
  sent: 'default',
  accepted: 'blue',
  rejected: 'red',
  completed: 'green',
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: orders = mockOrders, isLoading } = useQuery(['orders', statusFilter], () => 
    statusFilter 
      ? Promise.resolve(mockOrders.filter(o => o.status === statusFilter))
      : Promise.resolve(mockOrders)
  )

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Klien', dataIndex: 'client_name', key: 'client_name', render: (_, rec: Order) => (
      <div>{rec.client_name}<br/><span className="text-xs text-gray-500">{rec.client_email}</span></div>
    )},
    { title: 'Nominal', dataIndex: 'final_amount', key: 'final_amount',
      render: (v: number) => `Rp ${v.toLocaleString('id-ID')}` },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
    { title: 'Gateway', dataIndex: 'payment_gateway', key: 'payment_gateway' },
    { title: 'Action', key: 'action', render: () => 
      <Button size="small" type="link">Detail</Button> },
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="flex gap-2 mb-4">
        <Select
          placeholder="Filter Status"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
      </div>

      <Card>
        <Table 
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}