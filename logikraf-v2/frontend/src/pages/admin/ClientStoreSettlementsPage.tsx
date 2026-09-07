import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Input, message, Modal, Row, Space, Spin, Statistic, Table, Tag, Typography, Upload } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, InboxOutlined, ReloadOutlined, UploadOutlined, WalletOutlined } from '@ant-design/icons'
import { apiGet } from '../../lib/api'
import ClientStoreManager from './ClientStoreManager'

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
  proof_path: string
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

  // mark-paid modal state
  const [paySlug, setPaySlug] = useState<string | null>(null)
  const [paySettlement, setPaySettlement] = useState<StoreSettlement | null>(null)
  const [resultNote, setResultNote] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

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

  const openPay = (slug: string, st: StoreSettlement) => {
    setPaySlug(slug)
    setPaySettlement(st)
    setResultNote('')
    setProofFile(null)
    setPayError('')
  }

  const submitPay = async () => {
    if (!paySlug || !paySettlement || !proofFile) return
    setPaying(true)
    setPayError('')
    const fd = new FormData()
    fd.append('store', paySlug)
    fd.append('settlement_id', String(paySettlement.id))
    fd.append('result_note', resultNote)
    fd.append('proof', proofFile)
    try {
      const r = await fetch('/api/client-store-settlements/pay', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: fd,
      })
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.error || 'Gagal menandai dibayar')
      message.success('Settlement ditandai Dibayar ✓ — bukti terkirim ke client store')
      setPaySlug(null)
      setPaySettlement(null)
      load()
    } catch (e: any) {
      setPayError(e.message || 'Gagal menandai dibayar')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <Typography.Title level={4} className="!mb-1">Settlement Client Store</Typography.Title>
          <Typography.Text type="secondary">
            Pantauan uang penjualan client store yang ditampung akun pembayaran Logikraf. Setelah transfer manual, tandai Dibayar + upload bukti — owner client bisa mengunduhnya dari aplikasinya.
          </Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading} className="self-start md:self-auto">Muat Ulang</Button>
      </div>

      {error && <Alert type="error" showIcon message={error} />}
      <ClientStoreManager onChanged={load} />

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
                  <Col xs={24} sm={12} lg={6}><Statistic title="Total Pendapatan (pembeli bayar)" value={s.summary?.total_revenue || 0} prefix="Rp" /></Col>
                  <Col xs={24} sm={12} lg={6}><Statistic title="Dari Produk" value={s.summary?.product_revenue || 0} prefix="Rp" /></Col>
                  <Col xs={24} sm={12} lg={6}><Statistic title="Dari Ongkir" value={s.summary?.shipping_total || 0} prefix="Rp" /></Col>
                  <Col xs={24} sm={12} lg={6}><Statistic title="Pesanan Dibayar" value={s.summary?.paid_order_count || 0} suffix={`/ ${s.summary?.order_count || 0}`} /></Col>
                </Row>
                <Row gutter={[16, 16]} className="!mb-6">
                  <Col xs={24} sm={12} lg={8}>
                    <Card size="small" style={{ background: 'rgba(250,173,20,0.08)' }}>
                      <Statistic title="Sisa Belum Dicairkan" value={s.summary?.outstanding || 0} prefix="Rp" valueStyle={{ color: '#d48806', fontWeight: 700 }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Card size="small" style={{ background: 'rgba(250,173,20,0.05)' }}>
                      <Statistic title="Pengajuan Menunggu" value={s.summary?.pending_total || 0} prefix="Rp" />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Card size="small" style={{ background: 'rgba(82,196,26,0.07)' }}>
                      <Statistic title="Sudah Dicairkan" value={s.summary?.settled_total || 0} prefix="Rp" valueStyle={{ color: '#389e0d' }} />
                    </Card>
                  </Col>
                </Row>

                <Typography.Title level={5} className="!mb-3">Riwayat Pencairan</Typography.Title>

                {/* Mobile: kartu per pencairan */}
                <div className="md:hidden space-y-3">
                  {(s.settlements || []).length === 0 && (
                    <Typography.Text type="secondary">Belum ada pengajuan pencairan.</Typography.Text>
                  )}
                  {(s.settlements || []).map((st) => (
                    <Card key={st.id} size="small" className="!mb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <b className="text-[15px]">{fmtRp(st.amount)}</b>
                            {st.status === 'paid'
                              ? <Tag icon={<CheckCircleOutlined />} color="green" className="!m-0">Dibayar</Tag>
                              : <Tag icon={<ClockCircleOutlined />} color="orange" className="!m-0">Menunggu</Tag>}
                          </div>
                          <div className="text-[13px] text-gray-500 mt-1 break-words">{st.note || '—'}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2 leading-relaxed">
                        Diajukan {fmtDate(st.created_at)}
                        {st.status === 'paid' && st.paid_at && <> · Dibayar {fmtDate(st.paid_at)}</>}
                        {st.result_note && <div className="text-gray-500 mt-0.5">Hasil: {st.result_note}</div>}
                      </div>
                      {st.status === 'pending' && (
                        <Button type="primary" size="small" block icon={<UploadOutlined />}
                          className="!mt-3" onClick={() => openPay(s.slug, st)}>
                          Tandai Dibayar & Upload Bukti
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>

                {/* Desktop: tabel */}
                <div className="hidden md:block">
                <Table<StoreSettlement>
                  rowKey="id"
                  size="small"
                  pagination={false}
                  scroll={{ x: 860 }}
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
                    {
                      title: 'Aksi',
                      key: 'action',
                      render: (_, st) => st.status === 'pending' ? (
                        <Button size="small" type="primary" danger={false} icon={<UploadOutlined />} onClick={() => openPay(s.slug, st)}>
                          Tandai Dibayar
                        </Button>
                      ) : (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>selesai</Typography.Text>
                      ),
                    },
                  ]}
                />
                </div>
              </>
            )}
          </Card>
        ))}
      </Spin>

      <Modal
        open={!!paySettlement}
        title="Tandai Dibayar & Upload Bukti Transfer"
        okText={paying ? 'Mengirim…' : 'Konfirmasi Dibayar'}
        cancelText="Batal"
        confirmLoading={paying}
        onOk={submitPay}
        onCancel={() => setPaySettlement(null)}
        okButtonProps={{ disabled: !proofFile }}
        destroyOnClose
      >
        <div className="mb-3">
          <Typography.Text type="secondary">
            Pastikan transfer ke owner sudah benar-benar dilakukan sebelum konfirmasi.
          </Typography.Text>
        </div>
        {paySettlement && (
          <Alert
            className="!mb-4"
            type="info"
            showIcon
            message={`Pencairan ${fmtRp(paySettlement.amount)} — ${paySettlement.note || 'tanpa catatan'}`}
          />
        )}
        <div className="mb-3">
          <Typography.Text strong>File Bukti Transfer (wajib)</Typography.Text>
          <Upload.Dragger
            accept="image/*,.pdf"
            maxCount={1}
            beforeUpload={(file) => { setProofFile(file); return false }}
            onRemove={() => setProofFile(null)}
            fileList={proofFile ? [proofFile as any] : []}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Klik atau seret bukti ke sini</p>
            <p className="ant-upload-hint">Screenshot transfer / PDF struk (gambar atau PDF)</p>
          </Upload.Dragger>
        </div>
        <div>
          <Typography.Text strong>Keterangan Transfer (opsional)</Typography.Text>
          <Input
            className="!mt-1"
            placeholder="mis. BCA 2.000.000 ref #MG-0910"
            value={resultNote}
            onChange={(e) => setResultNote(e.target.value)}
          />
        </div>
        {payError && <Alert className="!mt-3" type="error" showIcon message={payError} />}
      </Modal>
    </div>
  )
}
