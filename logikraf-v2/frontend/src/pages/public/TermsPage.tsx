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
          <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed">
            <p>Selamat datang di <strong>Logika Kreatif Indonesia (Logikraf)</strong>. Syarat dan Ketentuan ini ("Perjanjian") mengatur akses dan penggunaan Anda terhadap layanan kami, baik untuk Layanan IT Solutions maupun Produk Perangkat Lunak sebagai Layanan (SaaS).</p>
            <h3 className="text-xl font-bold mt-8 mb-4">1. Layanan Kami</h3>
            <p>Logikraf sebagai Software House menyediakan dua kategori layanan utama:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Layanan IT Solutions:</strong> Mencakup namun tidak terbatas pada Web Development, Mobile App Development, UI/UX Design, Branding, dan Digital Marketing yang dikerjakan berdasarkan pesanan khusus (custom project).</li>
              <li><strong>Layanan SaaS:</strong> Produk perangkat lunak berbasis langganan yang disediakan "sebagaimana adanya" (as-is) tanpa modifikasi khusus (kecuali disepakati lain).</li>
            </ul>
            <h3 className="text-xl font-bold mt-8 mb-4">2. Hak Kekayaan Intelektual</h3>
            <p><strong>2.1 Layanan IT Solutions:</strong> Hak cipta penuh atas hasil kerja (deliverables) akan dialihkan kepada Anda setelah seluruh kewajiban pembayaran dinyatakan lunas.</p>
            <p><strong>2.2 Layanan SaaS:</strong> Anda diberikan lisensi non-eksklusif, tidak dapat dialihkan, untuk menggunakan perangkat lunak selama masa langganan aktif.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">3. Kebijakan Pembayaran</h3>
            <p>Semua pembayaran dilakukan melalui gerbang pembayaran resmi yang telah terintegrasi. Kebijakan masing-masing penyedia berlaku sepenuhnya terhadap transaksi Anda:</p>
            {gateways.length === 0 ? (
              <p className="text-text-muted">Gerbang pembayaran akan diinformasikan saat checkout.</p>
            ) : (
              <div className="space-y-3 mt-3">
                {gateways.map(g => (
                  <p key={g.id}><strong>{g.name}:</strong> {g.policies}</p>
                ))}
              </div>
            )}
            <p className="mt-3">Untuk Layanan IT Solutions, pembayaran umumnya dibagi menjadi beberapa termin/milestone. Pekerjaan tidak akan dilanjutkan ke tahap berikutnya jika ada tagihan milestone yang tertunggak.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">4. Kebijakan Pengembalian Dana (Refund)</h3>
            <p>Uang muka (Down Payment) untuk Layanan IT Solutions tidak dapat dikembalikan (non-refundable) jika proyek dibatalkan oleh pihak klien secara sepihak setelah proses desain atau pengerjaan dimulai.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">5. Tanggung Jawab (Liability)</h3>
            <p>Logikraf berupaya memberikan layanan terbaik dengan uptime yang optimal. Namun, kami tidak bertanggung jawab atas kerugian finansial atau hilangnya data akibat force majeure, serangan siber dari pihak ketiga, atau kesalahan teknis dari penyedia infrastruktur cloud.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">6. Hukum yang Berlaku</h3>
            <p>Syarat dan Ketentuan ini tunduk pada hukum negara Republik Indonesia. Segala perselisihan yang timbul akan diselesaikan secara musyawarah, atau melalui yurisdiksi Pengadilan Negeri di Indonesia jika musyawarah tidak mencapai mufakat.</p>
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}
