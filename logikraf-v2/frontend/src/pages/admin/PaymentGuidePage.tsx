import { Button, Card, Space, Typography, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import Markdown from '../../components/Markdown'
import { PAYMENT_GUIDE_MD } from '../../content/paymentGuide'

export default function PaymentGuidePage() {
  const download = async () => {
    try {
      const blob = new Blob([PAYMENT_GUIDE_MD], { type: 'text/markdown;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `panduan-payment-hub-client-store-${new Date().toISOString().slice(0, 10)}.md`
      a.click()
      URL.revokeObjectURL(a.href)
      message.success('Panduan diunduh (.md) ✓')
    } catch {
      message.error('Gagal mengunduh panduan')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 980 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <div>
          <Typography.Title level={4} style={{ marginBottom: 2 }}>
            Panduan Payment Hub — Client Store & Settlement
          </Typography.Title>
          <Typography.Text type="secondary">
            Langkah membuat project client baru yang pembayarannya lewat Logikraf. Dokumen internal — bisa diunduh.
          </Typography.Text>
        </div>
        <Button type="primary" icon={<DownloadOutlined />} onClick={download}>
          Download Panduan (.md)
        </Button>
      </div>
      <Card>
        <Markdown md={PAYMENT_GUIDE_MD} />
      </Card>
    </div>
  )
}
