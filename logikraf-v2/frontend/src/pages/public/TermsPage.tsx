import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway { id: string; name: string; policies: string }

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
          <p className="text-text-muted text-sm mb-10">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed space-y-6">
            <p>Selamat datang di <strong>Logika Kreatif Indonesia (Logikraf)</strong>. Syarat dan Ketentuan ini ("Perjanjian") mengatur akses dan penggunaan Anda terhadap layanan kami, baik untuk Layanan IT Solutions, Paket Pengembangan UMKM & Startup, maupun Produk Digital berlisensi.</p>

            <h3 className="text-xl font-bold text-text-main mt-8 mb-3">1. Layanan Kami</h3>
            <p>Logikraf sebagai Digital Creative Agency & Software House menyediakan dua kategori layanan utama:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Layanan IT Solutions & Custom Development:</strong> Mencakup Web Development, Mobile App Development, UI/UX Design, Branding, dan Digital Marketing yang dikerjakan berdasarkan kontrak dan tahapan pengerjaan (milestone).</li>
              <li><strong>Paket Layanan Digital & SaaS:</strong> Paket siap pakai untuk pembuatan website instan, sistem digital, dan lisensi software dengan ruang lingkup fitur yang telah ditentukan secara transparan.</li>
            </ul>

            <h3 className="text-xl font-bold text-text-main mt-8 mb-3">2. Hak Kekayaan Intelektual & Lisensi</h3>
            <p><strong>2.1 Layanan Kustom / IT Solutions:</strong> Seluruh hak cipta dan kepemilikan kode sumber atas hasil akhir (deliverables) diserahkan penuh kepada Klien setelah seluruh tagihan pembayaran termin/milestone diselesaikan.</p>
            <p><strong>2.2 Paket SaaS / Template:</strong> Klien diberikan lisensi non-eksklusif untuk menggunakan platform selama masa aktif layanan tanpa hak menjual kembali lisensi tersebut kepada pihak ketiga.</p>

            <h3 className="text-xl font-bold text-text-main mt-8 mb-3">3. Ketentuan Pembayaran & Gerbang Pembayaran Resmi</h3>
            <p>Semua transaksi pembayaran di Logikraf diproses secara aman melalui gerbang pembayaran (payment gateway) resmi yang telah berlisensi dari Bank Indonesia. Metode yang didukung meliputi:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Virtual Account Bank:</strong> BCA, Mandiri, BNI, BRI, Permata, Danamon, CIMB Niaga.</li>
              <li><strong>QRIS & E-Wallet:</strong> GoPay, OVO, DANA, ShopeePay, LinkAja.</li>
              <li><strong>Gerai Ritel:</strong> Alfamart & Indomaret.</li>
              <li><strong>Kartu Kredit / Debit Online:</strong> Visa & MasterCard dengan 3D Secure.</li>
            </ul>

            <div className="bg-canvas-light p-5 rounded-xl border border-border-minimal my-4">
              <h4 className="font-semibold text-text-main text-base mb-2">Kebijakan Penyedia Gerbang Pembayaran:</h4>
              {gateways.length === 0 ? (
                <p className="text-text-muted text-sm">Gerbang pembayaran aktif: <strong>iPaymu, Midtrans, dan Xendit</strong> (Semua transaksi terenkripsi SSL 256-bit dan diawasi oleh Bank Indonesia).</p>
              ) : (
                <div className="space-y-2.5 text-sm">
                  {gateways.map(g => (
                    <p key={g.id}><strong className="text-brand-primary">{g.name}:</strong> <span className="text-text-muted">{g.policies}</span></p>
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-text-main mt-8 mb-3">4. Kebijakan Pengembalian Dana (Refund Policy)</h3>
            <p>Kami berkomitmen memberikan kepuasan maksimal kepada setiap klien. Kebijakan refund diatur sebagai berikut:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Kelayakan Refund (Eligible):</strong> Pengembalian dana dapat disetujui apabila terjadi:
                <ul className="list-circle pl-6 mt-1 space-y-1 text-sm text-text-muted">
                  <li>Pembayaran ganda (double charge) akibat kendala jaringan perbankan.</li>
                  <li>Pembatalan pemesanan Paket Layanan sebelum tim teknis memulai fase analisis kebutuhan atau desain (maksimal 1x24 jam setelah pembayaran).</li>
                  <li>Ketidakmampuan Logikraf dalam menyelesaikan deliverable utama sesuai kesepakatan tertulis (SLA) tanpa adanya faktor force majeure.</li>
                </ul>
              </li>
              <li><strong>Ketentuan Non-Refundable:</strong> Uang Muka (Down Payment) atau biaya termin milestone yang tahap pengerjaannya telah selesai dan disetujui Klien tidak dapat dikembalikan.</li>
              <li><strong>Alur & Batas Waktu Pengajuan:</strong>
                <ul className="list-circle pl-6 mt-1 space-y-1 text-sm text-text-muted">
                  <li>Klien wajib mengirimkan permohonan tertulis ke email <strong>support@logikraf.id</strong> atau WhatsApp Helpdesk dengan melampirkan: Nomor Invoice, Bukti Transfer/Transaksi, dan Alasan Pengajuan.</li>
                  <li>Tim keuangan kami akan memverifikasi permohonan dalam waktu <strong>1–2 hari kerja</strong>.</li>
                  <li>Jika disetujui, dana akan dikembalikan ke rekening bank atau sumber pembayaran asal dalam waktu <strong>3–7 hari kerja</strong> (tergantung kebijakan kliring bank penerbit).</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-text-main mt-8 mb-3">5. Batasan Tanggung Jawab & Keamanan</h3>
            <p>Logikraf menerapkan standar keamanan tinggi pada seluruh infrastruktur server. Namun, kami tidak bertanggung jawab atas kerugian tidak langsung yang disebabkan oleh force majeure, kegagalan penyedia internet pihak ketiga, atau kelalaian Klien dalam menjaga kerahasiaan kredensial akun.</p>

            <h3 className="text-xl font-bold text-text-main mt-8 mb-3">6. Hubungi Layanan Pelanggan</h3>
            <p>Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini atau membutuhkan bantuan transaksi pembayaran, silakan hubungi kami:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Email:</strong> support@logikraf.id / halo@logikraf.id</li>
              <li><strong>WhatsApp Helpdesk:</strong> +62 812-3456-7890</li>
              <li><strong>Alamat Kantor:</strong> PT. Logika Kreatif Indonesia, Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}
