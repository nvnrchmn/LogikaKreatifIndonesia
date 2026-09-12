import { useEffect, useState } from 'react'
import { Button, Card, Input, Modal, Select, Space, Table, Tag, Typography, message } from 'antd'
import { apiGet, apiPost, apiPut } from '../../lib/api'

type Row = {
  id: number
  subject: string
  description: string
  priority: string
  status: string
  order_id?: number | null
  user_name: string
  user_email: string
  reply_count: number
  created_at: string
  updated_at: string
}

type Reply = { id: number; author: string; author_name: string; body: string; created_at: string }
type Detail = { ticket: Row; user: { name: string; email: string }; replies: Reply[] }

const STATUS = ['open', 'pending', 'resolved', 'closed']
const tone = (s: string) => (s === 'open' ? 'red' : s === 'pending' ? 'orange' : s === 'resolved' ? 'green' : 'default')
const when = (s: string) => (s ? new Date(s).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '')

export default function AdminTicketsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async (term: string) => {
    setLoading(true)
    try {
      const d = (await apiGet('/api/tickets-inbox' + (term ? '?q=' + encodeURIComponent(term) : ''))) as unknown as { tickets?: Row[] }
      setRows(d.tickets || [])
    } catch {
      message.error('Gagal memuat tiket')
    }
    setLoading(false)
  }

  useEffect(() => {
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = async (id: number) => {
    const d = (await apiGet('/api/tickets-inbox/' + id)) as unknown as Detail
    setDetail(d)
  }

  const buka = async (id: number) => {
    setOpen(true)
    setDetail(null)
    try {
      await refresh(id)
    } catch {
      message.error('Gagal memuat detail tiket')
    }
  }

  const balas = async () => {
    if (!detail || !body.trim()) return
    setBusy(true)
    try {
      await apiPost('/api/tickets-inbox/' + detail.ticket.id + '/replies', { body })
      setBody('')
      message.success('Balasan terkirim — klien diberi tahu via email + WA')
      await refresh(detail.ticket.id)
      load(q)
    } catch {
      message.error('Gagal mengirim balasan')
    }
    setBusy(false)
  }

  const ubahStatus = async (status: string) => {
    if (!detail) return
    try {
      await apiPut('/api/tickets-inbox/' + detail.ticket.id + '/status', { status })
      message.success('Status tiket diperbarui')
      await refresh(detail.ticket.id)
      load(q)
    } catch {
      message.error('Gagal mengubah status')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: 'Tiket',
      dataIndex: 'subject',
      render: (v: string, r: Row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.user_name} · {r.user_email}</div>
        </div>
      ),
    },
    { title: 'Prioritas', dataIndex: 'priority', width: 100 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (v: string) => <Tag color={tone(v)}>{v}</Tag>,
    },
    { title: 'Balasan', dataIndex: 'reply_count', width: 90 },
    { title: 'Diperbarui', dataIndex: 'updated_at', width: 170, render: (v: string) => when(v) },
    { title: '', key: 'aksi', width: 90, render: (_: unknown, r: Row) => <Button size="small" onClick={() => buka(r.id)}>Buka</Button> },
  ]

  return (
    <div style={{ padding: 4 }}>
      <Typography.Title level={4} style={{ marginBottom: 4 }}>Tiket Klien</Typography.Title>
      <Typography.Text type="secondary">
        Pertanyaan dan keluhan dari portal klien. Balasan Anda dikirim ke email + WhatsApp klien.
      </Typography.Text>

      <Card style={{ marginTop: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Cari subjek, nama, atau email klien"
            allowClear
            style={{ width: 340 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(v) => load(v)}
          />
          <Button onClick={() => load(q)} loading={loading}>Muat Ulang</Button>
        </Space>

        <Table<Row>
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 15, showSizeChanger: false }}
        />
      </Card>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={760}
        title={detail ? '#' + detail.ticket.id + ' — ' + detail.ticket.subject : 'Memuat…'}
      >
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {detail.user.name} · {detail.user.email}
              {detail.ticket.order_id ? ' · pesanan #' + detail.ticket.order_id : ''} · dibuka {when(detail.ticket.created_at)}
            </div>

            <Space>
              <span style={{ fontSize: 12 }}>Status:</span>
              <Select size="small" value={detail.ticket.status} style={{ width: 140 }} onChange={ubahStatus}>
                {STATUS.map((s) => (
                  <Select.Option key={s} value={s}>{s}</Select.Option>
                ))}
              </Select>
            </Space>

            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>PESAN AWAL</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{detail.ticket.description}</div>
            </div>

            {detail.replies.map((r) => (
              <div
                key={r.id}
                style={{
                  background: r.author === 'admin' ? '#f6f9ff' : '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
                  {(r.author === 'admin' ? r.author_name || 'Tim Logikraf' : r.author_name || 'Klien').toUpperCase()} · {when(r.created_at)}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{r.body}</div>
              </div>
            ))}

            <div>
              <Input.TextArea
                rows={4}
                placeholder="Tulis balasan untuk klien…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <Button type="primary" style={{ marginTop: 8 }} loading={busy} onClick={balas}>
                Kirim Balasan
              </Button>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  )
}
