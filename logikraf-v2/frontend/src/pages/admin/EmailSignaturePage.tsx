import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Input, message, Row, Space, Tag, Typography, Upload } from 'antd'
import { CopyOutlined, DownloadOutlined, OpenInNewOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import { apiGet, apiPut, auth } from '../../lib/api'

const TPL = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2430;line-height:1.5\">\n  <tr>\n    <td valign=\"top\" style=\"padding:0 16px 0 0;border-right:2px solid #0052FF\">\n      <img src=\"{{logo}}\" width=\"{{logo_size}}\" height=\"{{logo_size}}\" alt=\"Logikraf\" style=\"display:block;border:0;outline:none\">\n    </td>\n    <td valign=\"top\" style=\"padding:0 0 0 16px\">\n      <div style=\"font-size:15px;font-weight:bold;color:#0b1220\">{{nama}}</div>\n      <div style=\"font-weight:600;color:#0052FF\">{{jabatan}}</div>\n      <div style=\"color:#6b7280;margin-top:4px\">{{perusahaan}}</div>\n      <div style=\"margin-top:9px\">\n        <div style=\"margin:0 0 3px 0\"><span style=\"color:#6b7280\">Email</span> &nbsp;<a href=\"mailto:{{email}}\" style=\"color:#1f2430;text-decoration:none\">{{email}}</a></div>\n        <div style=\"margin:0 0 3px 0\"><span style=\"color:#6b7280\">WhatsApp</span> &nbsp;<a href=\"https://wa.me/{{wa}}\" style=\"color:#1f2430;text-decoration:none\">{{wa_pretty}}</a></div>\n        <div style=\"margin:0\"><span style=\"color:#6b7280\">Web</span> &nbsp;<a href=\"{{web}}\" style=\"color:#0052FF;text-decoration:none\">{{web_label}}</a></div>\n      </div>\n    </td>\n  </tr>\n</table>\n"
const DEFAULTS: Record<string, string> = {"wa": "628983342429", "wa_pretty": "+62 898-3342-429", "web": "https://logikraf.id", "web_label": "logikraf.id", "perusahaan": "PT Logika Kreatif Indonesia &middot; Bogor, Jawa Barat", "logo": "https://logikraf.id/brand/sig-logo.png", "logo_size": "76"}
const MAILBOXES: Mb[] = [{"slug": "novanurachman", "nama": "Nova Nurachman", "jabatan": "Founder & IT Lead", "email": "novanurachman@logikraf.id"}, {"slug": "support", "nama": "Tim Support Logikraf", "jabatan": "Layanan Mitra & Pelanggan", "email": "support@logikraf.id"}, {"slug": "admin", "nama": "Admin Logikraf", "jabatan": "Administrasi & Penagihan", "email": "admin@logikraf.id"}, {"slug": "coba", "nama": "Logikraf", "jabatan": "Kotak Uji Coba", "email": "coba@logikraf.id"}]

export type Mb = { slug: string; nama: string; jabatan: string; email: string; wa?: string; logo?: string }
type Cfg = { defaults: Record<string, string>; mailboxes: Mb[] }

const DEF_FIELDS = ['wa', 'wa_pretty', 'web', 'web_label', 'perusahaan', 'logo']
const MB_FIELDS = ['nama', 'jabatan', 'email']

const render = (d: Record<string, string>) => TPL.replace(/\{\{(\w+)\}\}/g, (_m: string, k: string) => d[k] ?? '')

export default function EmailSignaturePage() {
  const [cfg, setCfg] = useState<Cfg>(() => {
    try { return (JSON.parse(localStorage.getItem('sigcfg') || 'null') as Cfg) || { defaults: DEFAULTS, mailboxes: MAILBOXES } } catch { return { defaults: DEFAULTS, mailboxes: MAILBOXES } }
  })
  const setDef = (k: string, v: string) => setCfg((c) => ({ ...c, defaults: { ...c.defaults, [k]: v } }))
  const setMb = (i: number, k: string, v: string) => setCfg((c) => ({ ...c, mailboxes: c.mailboxes.map((m, j) => (j === i ? { ...m, [k]: v } : m)) }))
  const full = (m: Mb) => ({ ...cfg.defaults, ...m }) as Record<string, string>
  const [saving, setSaving] = useState(false)
  const load = async () => {
    try {
      const d = (await apiGet('/api/settings/email_signatures')) as unknown as { value?: string }
      if (d && d.value) { const c = JSON.parse(d.value) as Cfg; if (c && c.mailboxes && c.mailboxes.length) setCfg(c) }
    } catch { /* belum ada data tersimpan di server */ }
  }
  useEffect(() => { void load() }, [])
  const save = async () => {
    setSaving(true)
    try {
      await apiPut('/api/settings/email_signatures', { value: JSON.stringify(cfg) })
      localStorage.setItem('sigcfg', JSON.stringify(cfg))
      message.success('Tersimpan di server — berlaku untuk semua perangkat')
    } catch (e) { message.error((e as Error).message || 'Gagal menyimpan') } finally { setSaving(false) }
  }
  const upload = async (i: number, file: File) => {
    const fd = new FormData()
    fd.append('image', file)
    try {
      const r = await fetch('/api/upload?folder=signature', { method: 'POST', headers: auth(), body: fd })
      const d = (await r.json()) as { url?: string; error?: string }
      if (!r.ok || !d.url) throw new Error(d.error || 'upload gagal')
      setMb(i, 'logo', d.url)
      message.success('Foto terunggah dan dipakai untuk mailbox ini')
    } catch (e) { message.error((e as Error).message || 'Gagal upload gambar') }
  }
  const reset = () => { localStorage.removeItem('sigcfg'); setCfg({ defaults: DEFAULTS, mailboxes: MAILBOXES }); message.info('Dikembalikan ke default') }
  const dl = (m: Mb) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([render(full(m))], { type: 'text/html' })); a.download = 'sig-' + m.slug + '.htm'; a.click(); URL.revokeObjectURL(a.href) }
  const cp = async (m: Mb) => { await navigator.clipboard.writeText(render(full(m))); message.success('HTML tanda tangan disalin') }
  const openTab = (m: Mb) => {
    const w = window.open('', '_blank')
    if (!w) { message.warning('Popup diblokir browser — izinkan popup untuk situs ini'); return }
    w.document.write('<html><head><title>sig-' + m.slug + '</title></head><body style="margin:0;padding:24px;background:#fff">' + render(full(m)) + '</body></html>')
    w.document.close()
  }
  const prev = useMemo(() => cfg.mailboxes.map((m) => ({ m, html: render(full(m)) })), [cfg])

  return (
    <div className="admin-page">
      <Typography.Title level={4} style={{ marginTop: 0 }}>Signature Email</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ maxWidth: 860 }}>
        Kelola tanda tangan email tiap mailbox. Unduh file <b>.htm</b> lalu simpan ke
        <b> %APPDATA%\Microsoft\Signatures\</b> di Windows, kemudian pilih di Outlook
        (File &rarr; Options &rarr; Mail &rarr; Signatures).
      </Typography.Paragraph>
      <Row gutter={16}>
        <Col xs={24} lg={11}>
          <Card size="small" title="Nilai umum (semua mailbox)">
            {DEF_FIELDS.map((k) => (
              <div key={k}>
                <div className="hint">{k}</div>
                <Input value={cfg.defaults[k]} onChange={(e) => setDef(k, e.target.value)} />
              </div>
            ))}
          </Card>
          {cfg.mailboxes.map((m, i) => (
            <Card key={m.slug} size="small" style={{ marginTop: 12 }} title={<Tag color="blue">{m.email}</Tag>}>
              {MB_FIELDS.map((k) => (
                <div key={k}>
                  <div className="hint">{k}</div>
                  <Input value={(m as unknown as Record<string, string>)[k]} onChange={(e) => setMb(i, k, e.target.value)} />
                </div>
              ))}
              <div className="hint">wa khusus (opsional)</div>
              <Input value={m.wa || ''} onChange={(e) => setMb(i, 'wa', e.target.value)} />
              <div className="hint">logo / foto khusus (opsional)</div>
              <Input value={m.logo || ''} onChange={(e) => setMb(i, 'logo', e.target.value)} />
              <Upload showUploadList={false} accept="image/*" beforeUpload={(f) => { void upload(i, f as File); return false }}>
                <Button size="small" icon={<UploadOutlined />} style={{ marginTop: 6 }}>Unggah foto</Button>
              </Upload>
              <Space style={{ marginTop: 10 }}>
                <Button size="small" icon={<DownloadOutlined />} onClick={() => dl(m)}>Unduh .htm</Button>
                <Button size="small" icon={<CopyOutlined />} onClick={() => cp(m)}>Salin HTML</Button>
                <Button size="small" type="primary" ghost icon={<OpenInNewOutlined />} onClick={() => openTab(m)}>Buka untuk disalin</Button>
              </Space>
            </Card>
          ))}
          <Space style={{ marginTop: 14 }}>
            <Button type="primary" loading={saving} onClick={save}>Terapkan &amp; Simpan</Button>
            <Button icon={<ReloadOutlined />} onClick={reset}>Reset</Button>
          </Space>
        </Col>
        <Col xs={24} lg={13}>
          <Card size="small" title="Pratinjau">
            {prev.map((p) => (
              <div key={p.m.slug} style={{ marginBottom: 18 }}>
                <div className="hint">{p.m.email}</div>
                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 14 }} dangerouslySetInnerHTML={{ __html: p.html }} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
