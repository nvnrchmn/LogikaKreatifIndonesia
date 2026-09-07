import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Row, Space, Spin, Statistic, Table, Tag, Typography } from 'antd'
import { ReloadOutlined, WalletOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { apiGet } from '../../lib/api'

interface StoreSummary {
  total_revenue: number
  product_revenue: number
  shipping_total: number
  paid_order_count: number
  order_count: number
  pending_total: number
  settled_total: number
  outstanding: number
  available_for_payout: number
}
interface StoreSettlement {
  id: number
  amount: number
  note: string
  status: 'pending' | 'paid'
  result_note: string
  created_at: string
  paid_at: string | null
}
interface StoreView {
  slug: string
  name: string
  reachable: boolean
  error?: string
  fetched_at: string
  summary?: StoreSummary
  settlements?: StoreSettlement[]
}

const fmtRp = (n?: number) => 'Rp ' + (n || 0).toLocaleString('id-ID')
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

export default function ClientStoreSettlementsPage() {
  const [stores, setStores] = useState<StoreView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const d = await apiGet('/api/client-store-settlements')
      setStores((d?.stores as StoreView[]) || [])
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={4} className="!mb-1">Settlement Client Store</Typography.Title>
          <Typography.Text type="secondary">
            Pantauan uang penjualan client store yang ditampung akun pembayaran Logikraf (contoh: Mystic Glide).
          </Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Muat Ulang</Button>
      </div>

      {error && <Alert type="error" showIcon message={error} />}

      <Spin spinning={loading}>
        {stores.map((s) => (
          <Card key={s.slug} className="!mb-4" title={
            <Space>
              <WalletOutlined />
              <span>{s.name}</span>
              {s.reachable ? <Tag color="green">Terhubung</Tag> : <Tag color="red">Tidak terjangkau</Tag>}
            </Space>
          } extra={<Typography.Text type="secondary" style={{ fontSize: 12 }}>diperbarui {s.reachable ? fmtDate(s.fetched_at) : '—'}</Typography.Text>}>
            {!s.reachable ? (
              <Alert type="warning" showIcon message={`Tidak dapat mengambil data dari ${s.name}: ${s.error || 'tidak diketahui'}`} />
            ) : (
              <>
                <Row gutter={[16, 16]} className="!mb-6">
                  <Col xs={12} md={6}><Statistic title="Total Pendapatan (pembeli bayar)" value={s.summary?.total_revenue || 0} prefix="Rp" /></Col>
                  <Col xs={12} md={6}><Statistic title="Dari Produk" value={s.summary?.product_revenue || 0} prefix="Rp" /></Col>
                  <Col xs={12} md={6}><Statistic title="Dari Ongkir" value={s.summary?.shipping_total || 0} prefix="Rp" /></Col>
                  <Col xs={12} md={6}><Statistic title="Pesanan Dibayar" value={s.summary?.paid_order_count || 0} suffix={`/ ${s.summary?.order_count || 0}`} /></Col>
                </Row>
                <Row gutter={[16, 16]} className="!mb-6">
                  <Col xs={12} md={6}>
                    <Card size="small" style={{ background: 'rgba(250,173,20,0.08)' }}>
                      <Statistic title="Sisa Belum Dicairkan" value={s.summary?.outstanding || 0} prefix="Rp" valueStyle={{ color: '#d48806', fontWeight: 700 }} />
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card size="small" style={{ background: 'rgba(250,173,20,0.05)' }}>
                      <Statistic title="Pengajuan Menunggu" value={s.summary?.pending_total || 0} prefix="Rp" />
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card size="small" style={{ background: 'rgba(82,196,26,0.07)' }}>
                      <Statistic title="Sudah Dicairkan" value={s.summary?.settled_total || 0} prefix="Rp" valueStyle={{ color: '#389e0d' }} />
                    </Card>
                  </Col>
                </Row>

                <Typography.Title level={5} className="!mb-3">Riwayat Pencairan</Typography.Title>
                <Table<StoreSettlement>
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={s.settlements || []}
                  locale={{ emptyText: 'Belum ada pengajuan pencairan.' }}
                  columns={[
                    { title: 'Tanggal', dataIndex: 'created_at', render: (v: string) => fmtDate(v) },
                    { title: 'Nominal', dataIndex: 'amount', render: (v: number) => <b>{fmtRp(v)}</b> },
                    { title: 'Catatan', dataIndex: 'note', render: (v: string) => v || '—' },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      render: (v: string) => v === 'paid'
                        ? <Tag icon={<CheckCircleOutlined />} color="green">Dibayar</Tag>
                        : <Tag icon={<ClockCircleOutlined />} color="orange">Menunggu</Tag>,
                    },
                    { title: 'Keterangan Hasil', dataIndex: 'result_note', render: (v: string) => v || '—' },
                    { title: 'Dibayar', dataIndex: 'paid_at', render: (v: string | null) => fmtDate(v) },
                  ]}
                />
              </>
            )}
          </Card>
        ))}
      </Spin>
    </div>
  )
}
