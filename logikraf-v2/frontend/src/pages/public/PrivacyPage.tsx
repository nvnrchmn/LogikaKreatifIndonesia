import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway {
  id: string
  name: string
  policies: string
}

export default function PrivacyPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))
  }, [])

  const gatewayNames = gateways.map(g => g.name).join(', ')

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Kebijakan Privasi</h1>
            <p className="text-text-muted text-sm mb-10">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            
            <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed space-y-6">
              <p><strong>Logika Kreatif Indonesia (Logikraf)</strong> berkomitmen penuh untuk melindungi privasi dan data pribadi seluruh pengunjung, klien, dan pengguna layanan kami. Kebijakan Privasi ini menjelaskan bagaimana data Anda dikumpulkan, digunakan, diproses, dan dilindungi secara aman.</p>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">1. Data yang Kami Kumpulkan</h3>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Informasi Identitas Kontak:</strong> Nama lengkap, nama bisnis/perusahaan, alamat email, dan nomor WhatsApp / telepon yang Anda isi pada formulir kontak atau pemesanan layanan.</li>
                <li><strong>Informasi Transaksi & Tagihan:</strong> Nomor referensi pesanan (Order ID), nominal transaksi, paket layanan yang dipilih, dan status pembayaran QRIS.</li>
                <li><strong>Keamanan Finansial:</strong> Kami <strong>tidak pernah mengumpulkan atau menyimpan kredensial perbankan, PIN, atau data finansial sensitif Anda</strong>. Semua pembayaran dilakukan langsung melalui pemindaian QRIS yang diproses secara terenkripsi oleh penyedia gerbang pembayaran resmi.</li>
              </ul>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">2. Gerbang Pembayaran Resmi & Pemrosesan Transaksi QRIS</h3>
              <p className="text-sm">
                Transaksi pembayaran digital di Logikraf diproses menggunakan standar QRIS nasional melalui mitra gerbang pembayaran resmi berlisensi Bank Indonesia:
              </p>
              
              <div className="bg-canvas-light p-5 rounded-xl border border-border-minimal my-4">
                <h4 className="font-semibold text-text-main text-sm mb-2.5">Penyedia Gerbang Pembayaran Aktif:</h4>
                {gateways.length === 0 ? (
                  <p className="text-text-muted text-xs">Payment Gateway resmi Logikraf terdaftar dan diawasi oleh Bank Indonesia dengan enkripsi SSL 256-bit.</p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {gateways.map(g => (
                      <div key={g.id} className="pb-2 border-b border-border-minimal/60 last:border-0 last:pb-0">
                        <strong className="text-brand-primary block mb-0.5">{g.name} (QRIS Processing):</strong>
                        <span className="text-text-muted">{g.policies}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">3. Penggunaan Data Pribadi</h3>
              <p className="text-sm">Data yang kami kumpulkan hanya digunakan untuk:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li>Memproses pesanan paket dan menerbitkan invoice digital resmi.</li>
                <li>Membangun komunikasi teknis dan penyelesaian proyek digital klien.</li>
                <li>Verifikasi otomatis status transaksi melalui Webhook {gatewayNames ? `(${gatewayNames})` : 'Payment Gateway'}.</li>
                <li>Menghubungi Anda terkait konfirmasi pesanan atau penyelesaian pengembalian dana (refund) jika berlaku.</li>
              </ul>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">4. Perlindungan & Keamanan Data</h3>
              <p className="text-sm">
                Seluruh pertukaran data antara browser Anda dan server kami dienkripsi menggunakan protokol SSL/HTTPS 256-bit standar perbankan. Akses data operasional dibatasi hanya untuk staf berwenang dengan otentikasi ketat.
              </p>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">5. Hubungi Tim Perlindungan Data Kami</h3>
              <p className="text-sm">
                Jika Anda memiliki pertanyaan seputar Kebijakan Privasi ini atau ingin mengajukan permohonan penghapusan data, silakan hubungi kami melalui:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Email:</strong> support@logikraf.id / halo@logikraf.id</li>
                <li><strong>WhatsApp:</strong> +62 812-3456-7890</li>
                <li><strong>Alamat:</strong> PT. Logika Kreatif Indonesia, Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
