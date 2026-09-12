import { useEffect, useState } from 'react'
import { LegalIdentity, LegalUpdated } from '../../hooks/useLegal'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway {
  id: string
  name: string
  policies: string
}

export default function RefundPolicyPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))

    fetch('/api/settings/public')
      .then(r => (r.ok ? r.json() : {}))
      .then(d => setSettings(d || {}))
      .catch(() => {})
  }, [])

  const email = settings.contact_email || 'support@logikraf.id'
  const wa = settings.contact_whatsapp || '+62 898 3342 429'
  const waNumber = wa.replace(/[^0-9]/g, '')

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Kebijakan Pengembalian Dana (Refund Policy)</h1>
            <LegalUpdated />

            <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed space-y-6">
              <p>Kami di <strong>Logika Kreatif Indonesia (Logikraf)</strong> berkomitmen terhadap transparansi dan kepuasan klien. Kebijakan pengembalian dana berikut berlaku untuk seluruh transaksi yang diproses melalui platform kami, termasuk pembayaran Paket Layanan Website melalui QRIS.</p>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">1. Kriteria Refund yang Disetujui</h3>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Terjadi <strong>double scanning / pembayaran ganda</strong> yang tidak disengaja.</li>
                <li><strong>Pembatalan pesanan Paket Layanan</strong> sebelum tim teknis memulai fase analisis/pengerjaan (maksimal 1x24 jam setelah pembayaran).</li>
                <li><strong>Kegagalan sistem teknis Logikraf</strong> dalam memproses deliverable sesuai kesepakatan awal (SLA).</li>
                <li>Pembayaran yang masuk <strong>tanpa pesanan yang valid</strong> (tidak ada order reference yang cocok).</li>
              </ul>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">2. Ketentuan yang Tidak Dapat Direfund</h3>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Pekerjaan yang sudah <strong>memasuki tahap pengerjaan/development</strong> dan berjalan sesuai SLA.</li>
                <li>Permintaan perubahan <strong>scope pekerjaan</strong> setelah proyek dimulai.</li>
                <li>Pembatalan sepihak oleh klien <strong>tanpa alasan yang sah</strong> setelah fase analisis dimulai.</li>
              </ul>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">3. Prosedur Pengajuan Refund</h3>
              <ol className="list-decimal pl-6 space-y-2 text-sm">
                <li>Klien mengirimkan bukti transaksi QRIS dan nomor pesanan (order reference) ke email <strong>{email}</strong> atau WhatsApp Helpdesk.</li>
                <li>Tim Logikraf melakukan verifikasi transaksi pada sistem pembayaran resmi (melalui gerbang pembayaran QRIS yang terlisensi Bank Indonesia).</li>
                <li>Status pengajuan akan dikonfirmasi melalui email/WhatsApp dalam <strong>1–2 hari kerja</strong>.</li>
                <li>Dana dikembalikan ke rekening/e-wallet asal dalam waktu <strong>3–7 hari kerja</strong> setelah pengajuan disetujui.</li>
              </ol>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">4. Metode Pengembalian Dana</h3>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Dana dikembalikan <strong>ke sumber pembayaran asal</strong> (rekening bank / e-wallet yang digunakan untuk transaksi QRIS).</li>
                <li>Apabila pengembalian ke sumber asal tidak memungkinkan, dana dapat ditransfer ke rekening bank atas nama klien setelah verifikasi identitas.</li>
                <li>Biaya transfer/administrasi yang timbul akibat kesalahan data penerima menjadi tanggung jawab klien.</li>
              </ul>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">5. Gerbang Pembayaran Resmi</h3>
              <div className="bg-canvas-light p-5 rounded-xl border border-border-minimal my-4">
                {gateways.length === 0 ? (
                  <p className="text-text-muted text-xs">Pembayaran diproses aman via gerbang pembayaran Xendit (terenkripsi SSL 256-bit dan diawasi oleh Bank Indonesia).</p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {gateways.map(g => (
                      <div key={g.id} className="pb-2 border-b border-border-minimal/60 last:border-0 last:pb-0">
                        <strong className="text-brand-primary block mb-0.5">{g.name}:</strong>
                        <span className="text-text-muted">{g.policies}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">6. Hubungi Layanan Pelanggan Resmi</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Email:</strong> {email}</li>
                <li><strong>WhatsApp Helpdesk:</strong> {wa}</li>
                <li><strong>Website:</strong> https://logikraf.id</li>
              </ul>
              <p className="text-xs text-text-muted pt-4">Dengan melakukan pembayaran melalui platform Logikraf, Anda dianggap telah membaca, memahami, dan menyetujui kebijakan pengembalian dana ini.</p>
            </div>
          </div>
        </div>
        <LegalIdentity />
      </div>
    </PublicLayout>
  )
}
