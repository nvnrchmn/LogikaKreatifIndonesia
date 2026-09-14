import { Alert, Card, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'
import ClientStoreManager from './ClientStoreManager'

const { Paragraph, Title } = Typography

// Halaman "Mitra & Store" — kelola store routing Payment Hub (nama, base URL, fee, key).
// Alur lengkap (store → sub-account XenPlatform Managed → invite → KYC) mengikuti
// kontrak kanonik: logikraf-partners/docs/xenplatform-subaccount-api-contract.md
export default function MitraStorePage() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>Mitra & Store</Title>
        <Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Kelola store routing Payment Hub: nama, base URL, fee, dan <code>X-Internal-Key</code>.
          Untuk akun login portal mitra + sub-account Xendit, gunakan halaman{' '}
          <Link to="/admin/partner-portal">Mitra & Portal</Link>.
        </Paragraph>
        <Alert
          type="info"
          showIcon
          message="Alur lengkap (kanonik)"
          description={
            <>
              Buat store di sini → buat sub-account XenPlatform Managed (<code>POST /v3/accounts</code>)
              → invite ke Authorized Representative → tunggu status <b>REGISTERED</b> (webhook{' '}
              <code>account.registered</code>) → KYC oleh AR (liveness tidak bisa diwakilkan).
              Kontrak API: <code>logikraf-partners/docs/xenplatform-subaccount-api-contract.md</code>
            </>
          }
        />
      </Card>
      <ClientStoreManager />
    </Space>
  )
}
