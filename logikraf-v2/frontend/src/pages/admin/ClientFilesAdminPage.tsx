import { useEffect, useState } from 'react'
import { Button, Card, Input, Space, Table, Tag, Typography, message } from 'antd'
import { apiGet, auth } from '../../lib/api'

type FileRow = { name: string; label: string; size: number; order_id: string; at: string }
type Bucket = { client_id: number; company: string; pic: string; phone: string; count: number; files: FileRow[] }
type Row = FileRow & { key: string; client_id: number; company: string }

const human = (b: number) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB')

export default function ClientFilesAdminPage() {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async (term = '') => {
    setLoading(true)
    try {
      const d = (await apiGet('/api/client-files' + (term ? '?q=' + encodeURIComponent(term) : ''))) as unknown as {
        clients?: Bucket[]
        total?: number
      }
      setBuckets(d.clients || [])
      setTotal(d.total || 0)
    } catch {
      message.error('Gagal memuat berkas klien')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const unduh = async (clientId: number, name: string, label: string) => {
    try {
      const r = await fetch('/api/client-files/' + clientId + '/' + encodeURIComponent(name), { headers: auth() })
      if (!r.ok) throw new Error('gagal')
      const b = await r.blob()
      const u = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = u
      a.download = label
      a.click()
      URL.revokeObjectURL(u)
    } catch {
      message.error('Gagal mengunduh berkas')
    }
  }

  const rows: Row[] = buckets.flatMap((b) =>
    b.files.map((f) => ({ ...f, key: b.client_id + '/' + f.name, client_id: b.client_id, company: b.company })),
  )

  return (
    <div style={{ padding: 4 }}>
      <Typography.Title level={4} style={{ marginBottom: 4 }}>
        Berkas dari Klien
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        Berkas yang diunggah klien lewat portal {total > 0 ? '(' + total + ' berkas)' : ''}. Isinya ada di server, tombol
        Unduh mengambilnya langsung.
      </Typography.Paragraph>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Cari nama berkas atau klien"
            allowClear
            style={{ width: 320 }}
            onSearch={(v) => {
              setQ(v)
              load(v)
            }}
          />
          <Button
            onClick={() => {
              setQ('')
              load('')
            }}
          >
            Muat ulang
          </Button>
        </Space>
      </Card>

      <Table<Row>
        rowKey="key"
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        columns={[
          {
            title: 'Klien',
            dataIndex: 'company',
            render: (v: string, r) => (
              <div>
                <div style={{ fontWeight: 600 }}>{v}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>klien #{r.client_id}</div>
              </div>
            ),
          },
          {
            title: 'Berkas',
            dataIndex: 'label',
            render: (v: string, r) => (
              <span>
                {v}
                {r.order_id ? (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    Pesanan #{r.order_id}
                  </Tag>
                ) : null}
              </span>
            ),
          },
          { title: 'Ukuran', dataIndex: 'size', width: 110, render: (v: number) => human(v) },
          { title: 'Waktu', dataIndex: 'at', width: 150 },
          {
            title: '',
            key: 'act',
            width: 110,
            render: (_, r) => (
              <Button size="small" onClick={() => unduh(r.client_id, r.name, r.label)}>
                Unduh
              </Button>
            ),
          },
        ]}
        locale={{ emptyText: q ? 'Tidak ada berkas yang cocok' : 'Belum ada berkas dari klien' }}
      />
    </div>
  )
}
