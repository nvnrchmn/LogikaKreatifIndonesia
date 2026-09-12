import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Descriptions, Form, Grid, Input, message, Modal, Select, Space, Spin, Table, Tag, Typography } from 'antd'
import { KeyOutlined, LinkOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons'
import { apiGet, apiPatch, apiPost } from '../../lib/api'

interface PartnerUserView { id: number; email: string; wa_phone?: string; active: boolean; must_change_pass: boolean; last_login_at?: string }
interface StoreView {
  id: number; slug: string; name: string; is_active: boolean
  sub_account_id?: string; entity_type?: string; kyc_status?: string; fee_pct: number
  xendit_account_status?: string; xendit_synced_at?: string
  partner_user?: PartnerUserView
}

const KYC_COLOR: Record<string, string> = {
  INVITED: 'blue', REGISTERED: 'default', AWAITING_DOCS: 'warning', PENDING_VERIFICATION: 'processing',
  AWAITING_RESUBMISSION: 'error', LIVE: 'success', DECLINED: 'error', SUSPENDED: 'error', DORMANT: 'default',
}
const KYC_LABEL: Record<string, string> = {
  INVITED: 'Diundang', REGISTERED: 'Terdaftar', AWAITING_DOCS: 'Menunggu Dokumen', PENDING_VERIFICATION: 'Review Xendit',
  AWAITING_RESUBMISSION: 'Perlu Ulang Upload', LIVE: 'Aktif', DECLINED: 'Ditolak', SUSPENDED: 'Ditangguhkan', DORMANT: 'Tidak Aktif',
  PASSED: 'Verifikasi Lolos', ACTIVE: 'Aktif', PENDING: 'Menunggu',
}
const genPass = () => { const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 12; i++) s += c[Math.floor(Math.random() * c.length)]; return s + '!7' }

interface XenAccount { id: string; email: string; status: string; business_name: string; created?: string }

/** Data akun yang ditarik langsung dari Xendit (endpoint refresh). */
interface XenditLive { sub_account_id?: string; account_status: string; business_name?: string; email?: string; xendit_updated?: string; synced_at?: string }

export default function PartnerPortalPage() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [stores, setStores] = useState<StoreView[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)
  const [savingUser, setSavingUser] = useState(false)
  const [savingXp, setSavingXp] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [xr, setXr] = useState<{ id: number; d: XenditLive } | null>(null)
  const [formUser] = Form.useForm()
  const [formXp] = Form.useForm()
  const [xenOpen, setXenOpen] = useState(false)
  const [xenList, setXenList] = useState<XenAccount[]>([])
  const [xenBusy, setXenBusy] = useState(false)
  const [linkMap, setLinkMap] = useState<Record<string, number | undefined>>({})

  const load = useCallback(() => {
    setLoading(true)
    apiGet('/api/client-store-partners')
      .then((d) => setStores((d?.data as StoreView[]) || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const syncXen = async () => {
    setXenBusy(true)
    try {
      const d = await apiGet('/api/xenplatform/accounts')
      const list = (d?.data as XenAccount[]) || []
      setXenList(list)
      if (list.length > 0) {
        setXenOpen(true)
      } else {
        setXenOpen(true)
        message.warning('Respons Xendit kosong. Kalau kamu yakin sudah mengundang sub-account, cek permission "Accounts Read / xenPlatform Read" di Settings → API Keys dashboard Xendit, lalu coba lagi.')
      }
    } catch (e) { message.error((e as Error).message) } finally { setXenBusy(false) }
  }

  const linkXen = async (acc: XenAccount) => {
    const sid = linkMap[acc.id]
    if (!sid) { message.warning('Pilih mitra tujuan dulu'); return }
    setXenBusy(true)
    try {
      await apiPatch(`/api/client-stores/${sid}/xenplatform`, {
        sub_account_id: acc.id, kyc_status: acc.status,
      })
      message.success(`Sub-account ${acc.business_name || acc.email} terhubung ke mitra`)
      setXenOpen(false); load()
    } catch (e) { message.error((e as Error).message) } finally { setXenBusy(false) }
  }

  const openStore = stores.find((x) => x.id === openId)
  const xLive = openStore && xr && xr.id === openStore.id ? xr.d : null
  const accStat = xLive?.account_status || openStore?.xendit_account_status
  const syncTxt = xLive?.synced_at || openStore?.xendit_synced_at

  // Refresh data akun dari Xendit (field XenPlatform read-only, tidak ada input manual)
  const refreshXendit = async (id: number) => {
    setRefreshing(true)
    try {
      const d = await apiGet(`/api/client-stores/${id}/xenplatform`) as unknown as XenditLive
      setXr({ id, d })
      message.success('Data Xendit diperbarui')
      load()
    } catch (e) { message.error((e as Error).message) } finally { setRefreshing(false) }
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
      await apiPost(`/api/client-stores/${openId}/partner-user`, {
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
      // Hanya entity_type yang manual; sub_account_id & kyc_status dikelola dari Xendit (read-only).
      await apiPatch(`/api/client-stores/${openId}/xenplatform`, { entity_type: v.entity_type })
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
      {isMobile ? (
        <div className="space-y-3">
          {loading && <div className="py-8 text-center text-text-muted"><Spin size="small" /> Memuat…</div>}
          {!loading && stores.length === 0 && <Typography.Paragraph type="secondary">Belum ada mitra terdaftar.</Typography.Paragraph>}
          {stores.map((s) => (
            <Card key={s.id} size="small" styles={{ body: { padding: 14 } }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Typography.Text strong className="block truncate">{s.name}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{s.slug}</Typography.Text>
                </div>
                {s.kyc_status ? <Tag color={KYC_COLOR[s.kyc_status] || 'default'}>{KYC_LABEL[s.kyc_status] || s.kyc_status}</Tag> : <Tag>—</Tag>}
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Entity</span><span>{s.entity_type || '—'}</span></div>
                <div className="flex justify-between gap-3"><span className="text-text-muted shrink-0">Sub-account</span>
                  <span className="truncate text-right">{s.sub_account_id ? <Typography.Text code style={{ fontSize: 11 }}>{s.sub_account_id.slice(0, 16)}…</Typography.Text> : <Typography.Text type="secondary">Belum terhubung</Typography.Text>}</span>
                </div>
                <div className="flex justify-between gap-3"><span className="text-text-muted shrink-0">Akun portal</span>
                  <span className="truncate text-right">{s.partner_user ? <span className="truncate">{s.partner_user.email}</span> : <Tag style={{ marginInlineEnd: 0 }}>Belum dibuat</Tag>}</span>
                </div>
              </div>
              <Button block className="mt-3" size="small" type="primary" ghost icon={<WalletOutlined />} onClick={() => openModal(s)}>Kelola Portal Mitra</Button>
            </Card>
          ))}
        </div>
      ) : (
        <Table rowKey="id" size="small" loading={loading} columns={cols} dataSource={stores} pagination={false} scroll={{ x: 860 }} />
      )}

      <Modal
        title="Kelola Portal Mitra" open={openId !== null} onCancel={() => setOpenId(null)} footer={null} width={isMobile ? '96%' : 560}
      >
        <Form form={formXp} layout="vertical" style={{ marginTop: 8 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input value="https://partners.logikraf.id" readOnly suffix={<LinkOutlined />} />
            <Button onClick={() => { navigator.clipboard?.writeText('https://partners.logikraf.id'); message.success('Link disalin') }}>Salin</Button>
          </Space.Compact>
          <div style={{ marginTop: 12 }}><Typography.Text strong>XenPlatform / Sub-account</Typography.Text></div>
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
            Data di bawah ini diambil <b>langsung dari Xendit</b> — tidak bisa diedit manual. Tekan
            <b> Refresh Data Xendit</b> untuk memperbarui.
          </Typography.Paragraph>
          <Descriptions size="small" column={1} bordered items={[
            { key: 'sub', label: 'Business ID Sub-account', children: openStore?.sub_account_id || '— belum terhubung —' },
            { key: 'biz', label: 'Nama usaha (Xendit)', children: xLive?.business_name || openStore?.name || '—' },
            { key: 'acc', label: 'Status akun (Xendit)', children: accStat ? <Tag color={KYC_COLOR[accStat] || 'default'}>{KYC_LABEL[accStat] || accStat}</Tag> : '— belum disinkron —' },
            { key: 'kyc', label: 'Status KYC (dari Xendit)', children: openStore?.kyc_status ? <Tag color={KYC_COLOR[openStore.kyc_status] || 'default'}>{KYC_LABEL[openStore.kyc_status] || openStore.kyc_status}</Tag> : '—' },
            { key: 'sync', label: 'Terakhir sinkron', children: syncTxt || '—' },
          ]} />
          <Space style={{ marginTop: 12 }}>
            <Button icon={<ReloadOutlined />} loading={refreshing} disabled={!openStore?.sub_account_id} onClick={() => openId && refreshXendit(openId)}>Refresh Data Xendit</Button>
          </Space>
          <Form.Item name="entity_type" label="Jenis Badan Usaha (opsional — Xendit tidak menyediakan data ini)" style={{ marginTop: 12, maxWidth: 440 }}>
              <Select options={[
                { value: 'SOLE_PROPRIETORSHIP', label: 'Badan Usaha Perorangan (CV / PT Perorangan)' },
                { value: 'INDIVIDUAL', label: 'Perorangan (khusus sub-account XenPlatform)' },
                { value: 'UNION', label: 'Koperasi' },
                { value: 'NON_PROFIT', label: 'Yayasan / Nirlaba' },
                { value: 'PMA', label: 'PT PMA (Penanaman Modal Asing)' },
              ]} />
            </Form.Item>
          <Space style={{ marginTop: 4 }}>
            <Button type="primary" ghost loading={savingXp} onClick={saveXp}>Simpan Jenis Badan Usaha</Button>
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
        open={xenOpen} onCancel={() => setXenOpen(false)} footer={null} width={isMobile ? '96%' : 760}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
          Daftar ini diambil langsung dari Xendit (GET /v2/accounts). Pilih mitra tujuan untuk mengisi
          Business ID + status KYC-nya di baris mitra, lalu tekan <b>Hubungkan</b>. Status KYC akan ikut
          tersinkron saat mitra menyelesaikan verifikasi.
        </Typography.Paragraph>
        <Table
          rowKey="id" size="small" dataSource={xenList} pagination={false} loading={xenBusy} scroll={{ x: 520 }}
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
