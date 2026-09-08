import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, Input, message, Modal, Select, Space, Table, Tag, Typography } from 'antd'
import { KeyOutlined, LinkOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons'
import { apiGet, apiPatch, apiPost } from '../../lib/api'

interface PartnerUserView { id: number; email: string; wa_phone?: string; active: boolean; must_change_pass: boolean; last_login_at?: string }
interface StoreView {
  id: number; slug: string; name: string; is_active: boolean
  sub_account_id?: string; entity_type?: string; kyc_status?: string; fee_pct: number
  partner_user?: PartnerUserView
}

const KYC_COLOR: Record<string, string> = {
  INVITED: 'blue', REGISTERED: 'default', AWAITING_DOCS: 'warning', PENDING_VERIFICATION: 'processing',
  AWAITING_RESUBMISSION: 'error', LIVE: 'success', DECLINED: 'error', SUSPENDED: 'error', DORMANT: 'default',
}
const KYC_LABEL: Record<string, string> = {
  INVITED: 'Diundang', REGISTERED: 'Terdaftar', AWAITING_DOCS: 'Menunggu Dokumen', PENDING_VERIFICATION: 'Review Xendit',
  AWAITING_RESUBMISSION: 'Perlu Ulang Upload', LIVE: 'Aktif', DECLINED: 'Ditolak', SUSPENDED: 'Ditangguhkan', DORMANT: 'Tidak Aktif',
}
const genPass = () => { const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 12; i++) s += c[Math.floor(Math.random() * c.length)]; return s + '!7' }

interface XenAccount { id: string; email: string; status: string; business_name: string; created?: string }

export default function PartnerPortalPage() {
  const [stores, setStores] = useState<StoreView[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)
  const [savingUser, setSavingUser] = useState(false)
  const [savingXp, setSavingXp] = useState(false)
  const [formUser] = Form.useForm()
  const [formXp] = Form.useForm()
  const [xenOpen, setXenOpen] = useState(false)
  const [xenList, setXenList] = useState<XenAccount[]>([])
  const [xenBusy, setXenBusy] = useState(false)
  const [linkMap, setLinkMap] = useState<Record<string, number | undefined>>({})

  const load = useCallback(() => {
    setLoading(true)
    apiGet('/admin/client-store-partners')
      .then((d) => setStores((d?.data as StoreView[]) || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const syncXen = async () => {
    setXenBusy(true)
    try {
      const d = await apiGet('/admin/xenplatform/accounts')
      setXenList((d?.data as XenAccount[]) || [])
      setXenOpen(true)
      if (!d?.data || (d.data as XenAccount[]).length === 0) message.info('Belum ada Managed sub-account di akun Xendit (atau belum diundang)')
    } catch (e) { message.error((e as Error).message) } finally { setXenBusy(false) }
  }

  const linkXen = async (acc: XenAccount) => {
    const sid = linkMap[acc.id]
    if (!sid) { message.warning('Pilih mitra tujuan dulu'); return }
    setXenBusy(true)
    try {
      await apiPatch(`/admin/client-stores/${sid}/xenplatform`, {
        sub_account_id: acc.id, kyc_status: acc.status,
      })
      message.success(`Sub-account ${acc.business_name || acc.email} terhubung ke mitra`)
      setXenOpen(false); load()
    } catch (e) { message.error((e as Error).message) } finally { setXenBusy(false) }
  }

  const openModal = (s: StoreView) => {
    setOpenId(s.id)
    formUser.setFieldsValue({
      email: s.partner_user?.email || '', wa_phone: s.partner_user?.wa_phone || '',
      password: '', show_pass: '',
    })
    formXp.setFieldsValue({
      sub_account_id: s.sub_account_id || '', entity_type: s.entity_type || 'INDIVIDUAL',
      kyc_status: s.kyc_status || 'REGISTERED',
    })
  }

  const saveUser = async () => {
    const v = await formUser.validateFields()
    setSavingUser(true)
    try {
      await apiPost(`/admin/client-stores/${openId}/partner-user`, {
        email: v.email.trim(), wa_phone: v.wa_phone || '', password: v.password,
      })
      message.success('Akun portal mitra disimpan')
      setOpenId(null); load()
    } catch (e) { message.error((e as Error).message) } finally { setSavingUser(false) }
  }

  const saveXp = async () => {
    const v = await formXp.validateFields()
    setSavingXp(true)
    try {
      await apiPatch(`/admin/client-stores/${openId}/xenplatform`, {
        sub_account_id: v.sub_account_id?.trim() || '', entity_type: v.entity_type, kyc_status: v.kyc_status,
      })
      message.success('Data XenPlatform disimpan')
      setOpenId(null); load()
    } catch (e) { message.error((e as Error).message) } finally { setSavingXp(false) }
  }

  const cols = [
    { title: 'Mitra', dataIndex: 'name', key: 'name', render: (_: string, r: StoreView) => (<><Typography.Text strong>{r.name}</Typography.Text><div><Typography.Text type="secondary">{r.slug}</Typography.Text></div></>) },
    { title: 'KYC', dataIndex: 'kyc_status', key: 'kyc', render: (k: string) => (k ? <Tag color={KYC_COLOR[k] || 'default'}>{KYC_LABEL[k] || k}</Tag> : <Tag>—</Tag>) },
    { title: 'Entity', dataIndex: 'entity_type', key: 'entity', render: (e: string) => e || '—' },
    { title: 'Akun Portal', key: 'user', render: (_: unknown, r: StoreView) => r.partner_user ? (<div><div>{r.partner_user.email}</div><Typography.Text type="secondary" style={{ fontSize: 12 }}>{r.partner_user.last_login_at ? `Login terakhir ${r.partner_user.last_login_at}` : 'Belum pernah login'}</Typography.Text></div>) : (<Tag>Belum dibuat</Tag>) },
    { title: 'Sub-account', dataIndex: 'sub_account_id', key: 'sub', render: (v: string) => (v ? <Typography.Text code style={{ fontSize: 11 }}>{v.slice(0, 18)}…</Typography.Text> : <Typography.Text type="secondary">—</Typography.Text>) },
    {
      title: '', key: 'act', width: 120, render: (_: unknown, r: StoreView) => (
        <Space>
          <Button size="small" type="primary" ghost icon={<WalletOutlined />} onClick={() => openModal(r)}>Portal</Button>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title={<Space><WalletOutlined /><span>Mitra & Portal XenPlatform</span></Space>}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={syncXen} loading={xenBusy}>Sinkron dari Xendit</Button>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Muat Ulang</Button>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary">
        Kelola akun login mitra di <Typography.Text code>partners.logikraf.id</Typography.Text> dan data sub-account Xendit per mitra.
        Kredensial dibuat di sini (admin); mitra wajib ganti password saat login pertama.
      </Typography.Paragraph>
      <Table rowKey="id" size="small" loading={loading} columns={cols} dataSource={stores} pagination={false} scroll={{ x: 860 }} />

      <Modal
        title="Kelola Portal Mitra" open={openId !== null} onCancel={() => setOpenId(null)} footer={null} width={560}
      >
        <Form form={formXp} layout="vertical" style={{ marginTop: 8 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input value="https://partners.logikraf.id" readOnly suffix={<LinkOutlined />} />
            <Button onClick={() => { navigator.clipboard?.writeText('https://partners.logikraf.id'); message.success('Link disalin') }}>Salin</Button>
          </Space.Compact>
          <div style={{ marginTop: 12 }}><Typography.Text strong>XenPlatform / Sub-account</Typography.Text></div>
          <Form.Item name="sub_account_id" label="Business ID Sub-account (dari dashboard Xendit)" style={{ marginTop: 8 }}><Input placeholder="mis. 6b1f…" /></Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="entity_type" label="Jenis Entity" style={{ width: 200 }}>
              <Select options={['INDIVIDUAL', 'SOLE_PROPRIETORSHIP', 'CORPORATION', 'PARTNERSHIP', 'COOPERATIVE'].map((x) => ({ value: x, label: x }))} />
            </Form.Item>
            <Form.Item name="kyc_status" label="Status KYC" style={{ width: 220 }}>
              <Select options={Object.keys(KYC_LABEL).map((k) => ({ value: k, label: KYC_LABEL[k] }))} />
            </Form.Item>
          </Space>
          <Space>
            <Button type="primary" loading={savingXp} onClick={saveXp}>Simpan XenPlatform</Button>
          </Space>
        </Form>

        <Form form={formUser} layout="vertical" style={{ marginTop: 20 }}>
          <div><Typography.Text strong><KeyOutlined /> Akun Login Portal Mitra</Typography.Text></div>
          <Form.Item name="email" label="Email login" rules={[{ required: true, type: 'email', message: 'Email valid wajib diisi' }]} style={{ marginTop: 8 }}>
            <Input placeholder="owner@tokomitra.id" />
          </Form.Item>
          <Form.Item name="wa_phone" label="No. WhatsApp (notifikasi)"><Input placeholder="628xxxxxxxxxx" /></Form.Item>
          <Form.Item name="password" label="Password awal" rules={[{ required: true, min: 8, message: 'Minimal 8 karakter' }]}>
            <Input.Password placeholder="Minimal 8 karakter" addonAfter={<Button type="link" size="small" onClick={() => formUser.setFieldValue('password', genPass())}>Generate</Button>} />
          </Form.Item>
          <Typography.Paragraph type="warning" style={{ fontSize: 12 }}>
            Simpan & kirim password ke mitra via WA/email — mitra WAJIB ganti saat login pertama. Mereset password di sini memaksa ganti password lagi.
          </Typography.Paragraph>
          <Button type="primary" loading={savingUser} onClick={saveUser}>Simpan Akun Portal</Button>
        </Form>
      </Modal>

      <Modal
        title="Sub-account Xendit (Managed) — hasil undangan"
        open={xenOpen} onCancel={() => setXenOpen(false)} footer={null} width={760}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
          Daftar ini diambil langsung dari Xendit (GET /v2/accounts). Pilih mitra tujuan untuk mengisi
          Business ID + status KYC-nya di baris mitra, lalu tekan <b>Hubungkan</b>. Status KYC akan ikut
          tersinkron saat mitra menyelesaikan verifikasi.
        </Typography.Paragraph>
        <Table
          rowKey="id" size="small" dataSource={xenList} pagination={false} loading={xenBusy}
          columns={[
            { title: 'Akun', key: 'n', render: (_: unknown, a: XenAccount) => (<div><Typography.Text strong>{a.business_name || '—'}</Typography.Text><div><Typography.Text type="secondary">{a.email}</Typography.Text></div></div>) },
            { title: 'Status', dataIndex: 'status', key: 's', width: 150, render: (s: string) => <Tag color={KYC_COLOR[s] || 'default'}>{KYC_LABEL[s] || s}</Tag> },
            {
              title: 'Hubungkan ke mitra', key: 'l', width: 260, render: (_: unknown, a: XenAccount) => (
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    style={{ width: '100%' }} placeholder="Pilih mitra…" showSearch optionFilterProp="label"
                    value={linkMap[a.id]} onChange={(v) => setLinkMap((m) => ({ ...m, [a.id]: v }))}
                    options={stores.map((s) => ({ value: s.id, label: s.name }))}
                  />
                  <Button type="primary" loading={xenBusy} onClick={() => linkXen(a)}>Hubungkan</Button>
                </Space.Compact>
              ),
            },
          ]}
        />
      </Modal>
    </Card>
  )
}
