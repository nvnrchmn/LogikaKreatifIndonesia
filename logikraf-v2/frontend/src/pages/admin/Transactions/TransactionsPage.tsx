import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, Table, Tag, Select, Popconfirm, message, Tooltip } from 'antd'
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'

interface TransactionRefund {
  id: string
  reason: string
  amount: number
  status?: string
}

interface Transaction {
  id: string
  order_id: string
  business_id: string
  amount: number
  fee: number
  net_amount: number
  payment_gateway: string
  status: string
  va_number?: string
  transfer_amount?: number
  refund_amount?: number
  created_at?: string
  refunds?: TransactionRefund[]
}

const mockTxns: Transaction[] = [
  {
    id: 'txn-001',
    order_id: 'ord-001',
    business_id: 'biz-001',
    amount: 50000000,
    fee: 2500000,
    net_amount: 47500000,
    payment_gateway: 'midtrans',
    status: 'success',
    va_number: '8821231234',
    transfer_amount: 50000000,
    created_at: '2026-08-10',
    refunds: []
  }
]

const statusColors: Record<string, string> = {
  pending: 'orange',
  success: 'green',
  failed: 'red',
  refunded: 'blue',
}

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: txns = mockTxns, isLoading } = useQuery(['transactions', statusFilter], () =>
    statusFilter 
      ? Promise.resolve(mockTxns.filter(t => t.status === statusFilter))
      : Promise.resolve(mockTxns)
  )

  const refundMutation = useMutation(
    () => { message.success('Refund diproses'); return Promise.resolve() },
    { onError: () => message.error('Gagal refund') }
  )

  const handleRefund = (txnId: string) => refundMutation.mutate()

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id' },
    { title: 'Jumlah', dataIndex: 'amount', key: 'amount',
      render: (v: number) => `Rp ${v.toLocaleString('id-ID')}` },
    { title: 'Net', dataIndex: 'net_amount', key: 'net_amount',
      render: (v: number) => `Rp ${v.toLocaleString('id-ID')}` },
    { title: 'Gateway', dataIndex: 'payment_gateway', key: 'payment_gateway' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
    { title: 'VA', dataIndex: 'va_number', key: 'va_number' },
    { title: 'Action', key: 'action', render: (_: any, r: Transaction) => (
      <Popconfirm title="Refund transaksi ini?" onConfirm={() => handleRefund(r.id)}>
        <Button type="link" danger><DeleteOutlined /></Button>
      </Popconfirm>
    )},
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      <div className="mb-4">
        <Select
          placeholder="Filter Status"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'success', label: 'Success' },
            { value: 'failed', label: 'Failed' },
            { value: 'refunded', label: 'Refunded' },
          ]}
        />
      </div>

      <Card>
        <Table 
          columns={columns}
          dataSource={txns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}