import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Input, message, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import { CopyOutlined, KeyOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { apiGet, auth } from '../../lib/api'

interface StoreRow {
  id: number
  slug: string
  name: string
  base_url: string
  is_active: boolean
  key_preview: string
  created_at: string
}

const copy = async (t: string, label = 'Disalin ke clipboard ✓') => {
  try {
    await navigator.clipboard.writeText(t)
    message.success(label)
  } catch {
    message.warning('Gagal menyalin otomatis — pilih & salin manual')
  }
}

export default function ClientStoreManager({ onChanged }: { onChanged?: () => void }) {
  const [rows, setRows] = useState<StoreRow[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [keyModal, setKeyModal] = useState<{ title: string; key: string; warning?: string } | null>(null)

  // create form
  const [fName, setFName] = useState('')
  const [fSlug, setFSlug] = useState('')
  const [fBase, setFBase] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // edit form
  const [editTarget, setEditTarget] = useState<StoreRow | null>(null)
  const [eName, setEName] = useState('')
  const [eBase, setEBase] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiGet('/api/client-store-settlements/stores')
      setRows((d?.stores as StoreRow[]) || [])
    } catch { setRows([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const slugFrom = (n: string) => n.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const create = async () => {
    if (!fName.trim() || !fBase.trim()) { message.warning('Nama & URL internal wajib diisi'); return }
    setSubmitting(true)
    try {
      const r = await fetch('/api/client-store-settlements/stores', {
        method: 'POST', headers: auth(), body: JSON.stringify({
          name: fName.trim(), slug: fSlug.trim() || undefined,
          base_url: fBase.trim().replace(/\/+$/, ''),
        }),
      })
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.error || 'Gagal membuat')
      setCreateOpen(false); setFName(''); setFSlug(''); setFBase('')
      setKeyModal({
        title: 'Client Store Dibuat — Salin Internal Key',
        key: d.internal_key,
        warning: 'Key ini hanya ditampilkan SEKALI. Pasang di aplikasi client sebagai nilai X-Internal-Key (mis. env MG_INTERNAL_KEY), lalu restart aplikasinya.',
      })
      load(); onChanged?.()
    } catch (e: any) { message.error(e.message) } finally { setSubmitting(false) }
  }

  const reveal = async (row: StoreRow) => {
    try {
      const d = await apiGet(`/api/client-store-settlements/stores/${row.id}/key`)
      setKeyModal({ title: `Internal Key — ${row.name}`, key: String((d as Record<string, unknown>)?.internal_key || '') })
    } catch (e: any) { message.error(e.message) }
  }

  const regenerate = async (row: StoreRow) => {
    try {
      const r = await fetch(`/api/client-store-settlements/stores/${row.id}/regenerate`, { method: 'POST', headers: auth() })
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.error || 'Gagal regenerate')
      setKeyModal({
        title: 'Key Baru — Segera Pasang',
        key: d.internal_key,
        warning: 'Key lama langsung TIDAK berlaku. Perbarui di aplikasi client (X-Internal-Key), lalu restart aplikasinya.',
      })
      load()
    } catch (e: any) { message.error(e.message) }
  }

  const toggleActive = async (row: StoreRow) => {
    try {
      const r = await fetch(`/api/client-store-settlements/stores/${row.id}`, {
        method: 'PUT', headers: auth(), body: JSON.stringify({ is_active: !row.is_active }),
      })
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.error || 'Gagal')
      message.success(row.is_active ? 'Store dinonaktifkan' : 'Store diaktifkan')
      load(); onChanged?.()
    } catch (e: any) { message.error(e.message) }
  }

  const remove = async (row: StoreRow) => {
    try {
      const r = await fetch(`/api/client-store-settlements/stores/${row.id}`, { method: 'DELETE', headers: auth() })
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.error || 'Gagal hapus')
      message.success('Client store dihapus')
      load(); onChanged?.()
    } catch (e: any) { message.error(e.message) }
  }

  const openEdit = (row: StoreRow) => {
    setEditTarget(row); setEName(row.name); setEBase(row.base_url)
  }
  const saveEdit = async () => {
    if (!editTarget) return
    try {
      const r = await fetch(`/api/client-store-settlements/stores/${editTarget.id}`, {
        method: 'PUT', headers: auth(), body: JSON.stringify({ name: eName.trim(), base_url: eBase.trim().replace(/\/+$/, '') }),
      })
      const d = await r.json().catch(() => null)
      if (!r.ok) throw new Error(d?.error || 'Gagal simpan')
      message.success('Perubahan disimpan')
      setEditTarget(null); load(); onChanged?.()
    } catch (e: any) { message.error(e.message) }
  }

  const columns = [
    { title: 'Nama', dataIndex: 'name', render: (v: string, r: StoreRow) => (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>{v}</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>slug: {r.slug}</Typography.Text>
      </Space>
    ) },
    { title: 'URL Internal', dataIndex: 'base_url', ellipsis: true },
    { title: 'Key', dataIndex: 'key_preview', render: (v: string) => <Typography.Text code style={{ fontSize: 12 }}>{v || '— belum diisi'}</Typography.Text> },
    { title: 'Status', dataIndex: 'is_active', width: 90, render: (v: boolean) => v
      ? <Tag color="green">Aktif</Tag> : <Tag color="default">Nonaktif</Tag> },
    { title: '', key: 'a', width: 330, render: (_: unknown, r: StoreRow) => (
      <Space size={4} wrap>
        <Button size="small" icon={<KeyOutlined />} onClick={() => reveal(r)}>Lihat Key</Button>
        <Popconfirm title={`Generate ulang key ${r.name}?`} description="Key lama langsung tidak berlaku." onConfirm={() => regenerate(r)} okText="Ya, ganti" okButtonProps={{ danger: true }}>
          <Button size="small">Regenerate</Button>
        </Popconfirm>
        <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
        <Button size="small" onClick={() => toggleActive(r)}>{r.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Button>
        <Popconfirm title={`Hapus ${r.name}?`} description="Data pantauan store ini ikut hilang." onConfirm={() => remove(r)} okText="Hapus" okButtonProps={{ danger: true }}>
          <Button size="small" danger>Hapus</Button>
        </Popconfirm>
      </Space>
    ) },
  ]

  return (
    <Card
      title={<Space><Typography.Text strong>Client Store Terdaftar</Typography.Text><Typography.Text type="secondary" style={{ fontSize: 12 }}>kelola toko client yang uangnya ditampung Logikraf</Typography.Text></Space>}
      extra={<Space>
        <Button size="small" icon={<ReloadOutlined />} onClick={load}>Muat Ulang</Button>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setCreateOpen(true); setFSlug('') }}>Tambah Client Store</Button>
      </Space>}
      style={{ marginBottom: 16 }}
    >
      {rows.length === 0 && !loading && <Alert type="info" showIcon message="Belum ada client store. Klik 'Tambah Client Store' untuk mendaftarkan toko pertama." />}
      <Table rowKey="id" size="small" loading={loading} columns={columns} dataSource={rows} pagination={false} scroll={{ x: 900 }} />

      {/* Modal tambah */}
      <Modal title="Tambah Client Store" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={create} confirmLoading={submitting} okText="Buat & Generate Key">
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <Typography.Text strong>Nama Toko</Typography.Text>
            <Input value={fName} onChange={e => { setFName(e.target.value); if (!fSlug) setFSlug(slugFrom(e.target.value)) }} placeholder="mis. Mystic Glide" />
          </div>
          <div>
            <Typography.Text strong>URL Internal (Base URL)</Typography.Text>
            <Input value={fBase} onChange={e => setFBase(e.target.value)} placeholder="mis. http://127.0.0.1:8095/api/v1/internal" />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Endpoint internal aplikasi client ({'{base}'}/finance/summary harus tersedia).</Typography.Text>
          </div>
          <div>
            <Typography.Text strong>Slug (opsional)</Typography.Text>
            <Input value={fSlug} onChange={e => setFSlug(e.target.value.trim())} placeholder="otomatis dari nama" />
          </div>
        </Space>
      </Modal>

      {/* Modal edit */}
      <Modal title="Edit Client Store" open={!!editTarget} onCancel={() => setEditTarget(null)} onOk={saveEdit} okText="Simpan">
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Input value={eName} onChange={e => setEName(e.target.value)} placeholder="Nama toko" />
          <Input value={eBase} onChange={e => setEBase(e.target.value)} placeholder="URL internal" />
        </Space>
      </Modal>

      {/* Modal key (sekali lihat / salin) */}
      <Modal title={keyModal?.title} open={!!keyModal} onCancel={() => setKeyModal(null)} footer={<Button type="primary" onClick={() => keyModal && copy(keyModal.key)} icon={<CopyOutlined />}>Salin Key</Button>}>
        {keyModal?.warning && <Alert type="warning" showIcon message={keyModal.warning} style={{ marginBottom: 12 }} />}
        <Typography.Paragraph copyable={{ text: keyModal?.key }} code style={{ wordBreak: 'break-all', fontSize: 13 }}>
          {keyModal?.key}
        </Typography.Paragraph>
      </Modal>
    </Card>
  )
}
