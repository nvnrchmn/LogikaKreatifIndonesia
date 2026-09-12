import { useEffect, useState } from 'react'
import { LegalIdentity, LegalUpdated } from '../../hooks/useLegal'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway {
  id: string
  name: string
  policies: string
}

export default function TermsPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))
  }, [])

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Syarat dan Ketentuan</h1>
            <LegalUpdated />

            <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed space-y-6">
              <p>Selamat datang di <strong>Logika Kreatif Indonesia (Logikraf)</strong>. Syarat dan Ketentuan ini ("Perjanjian") mengatur akses dan penggunaan Anda terhadap seluruh layanan kami, mencakup Layanan IT Solutions, Paket Pengembangan Website UMKM & Startup, dan Produk Digital terlisensi.</p>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">1. Ruang Lingkup Layanan</h3>
              <p className="text-sm">Logikraf menyediakan dua kategori layanan digital utama:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li><strong>Layanan IT Solutions & Custom Development:</strong> Jasa kustomisasi Web Development, Mobile App Development, UI/UX Design, dan Brand Identity yang dikerjakan berdasarkan kesepakatan kontrak tertulis (SOW/SLA).</li>
                <li><strong>Paket Layanan Digital & Website Siap Pakai:</strong> Solusi pembuatan website bisnis terstruktur dengan fitur yang telah ditentukan secara transparan pada etalase produk resmi Logikraf.</li>
              </ul>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">2. Ketentuan Pembayaran (Hanya Melalui QRIS)</h3>
              <p className="text-sm">
                Untuk menjamin kenyamanan, kecepatan verifikasi, dan keamanan maksimal, <strong>seluruh transaksi pembayaran di Logikraf diproses secara eksklusif menggunakan metode QRIS (Quick Response Code Indonesian Standard)</strong> yang berlisensi resmi Bank Indonesia.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Kompatibilitas Luas:</strong> Kode QRIS Dinamis dapat dipindai dari seluruh aplikasi Mobile Banking (BCA Mobile, Livin' Mandiri, BRImo, BNI Mobile, PermataMobile, CIMB OCTO, dll.) serta seluruh aplikasi Dompet Digital (GoPay, OVO, DANA, ShopeePay, LinkAja, AstraPay).</li>
                <li><strong>Verifikasi Otomatis Seketika:</strong> Status pembayaran akan otomatis terverifikasi (settled) secara <em>real-time</em> dalam hitungan detik setelah Anda menyelesaikan transfer via QRIS.</li>
              </ul>

              {/* Dynamic Gateways Section */}
              <div className="bg-canvas-light p-5 rounded-xl border border-border-minimal my-4">
                <h4 className="font-semibold text-text-main text-sm mb-2">Kebijakan Pemrosesan Gerbang Pembayaran QRIS:</h4>
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

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">3. Hak Kekayaan Intelektual</h3>
              <p className="text-sm">
                Seluruh hak cipta atas deliverables proyek digital akan diserahkan penuh kepada Klien setelah seluruh kewajiban pembayaran dinyatakan lunas.
              </p>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">4. Kebijakan Pengembalian Dana (Refund Policy)</h3>
              <p className="text-sm">Kami berkomitmen terhadap transparansi dan kepuasan klien. Kebijakan pengembalian dana untuk transaksi QRIS diatur sebagai berikut:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Kriteria Refund yang Disetujui:</strong>
                  <ul className="list-circle pl-6 mt-1 space-y-1 text-xs text-text-muted">
                    <li>Terjadi double scanning / pembayaran ganda yang tidak disengaja.</li>
                    <li>Pembatalan pesanan Paket Layanan sebelum tim teknis memulai fase analisis/pengerjaan (maksimal 1x24 jam setelah pembayaran).</li>
                    <li>Kegagalan sistem teknis Logikraf dalam memproses deliverable sesuai kesepakatan awal (SLA).</li>
                  </ul>
                </li>
                <li><strong>Prosedur Pengajuan:</strong> Klien mengirimkan bukti transaksi QRIS dan nomor pesanan ke email <strong>support@logikraf.id</strong> atau WhatsApp Helpdesk.</li>
                <li><strong>Waktu Pemrosesan:</strong> Verifikasi permohonan memakan waktu <strong>1–2 hari kerja</strong>, dan dana akan dicairkan kembali ke rekening/e-wallet asal dalam waktu <strong>3–7 hari kerja</strong>.</li>
              </ul>

              <h3 className="text-xl font-bold text-text-main mt-8 mb-3">5. Hubungi Layanan Pelanggan Resmi</h3>
              <p className="text-sm">Jika Anda membutuhkan bantuan terkait transaksi QRIS, silakan hubungi saluran resmi kami:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Email:</strong> support@logikraf.id</li>
                <li><strong>WhatsApp Helpdesk:</strong> +62 898 3342 429</li>
                <li><strong>Website:</strong> https://logikraf.id</li>
              </ul>
            </div>
          </div>
        </div>
        <LegalIdentity />
      </div>
    </PublicLayout>
  )
}
