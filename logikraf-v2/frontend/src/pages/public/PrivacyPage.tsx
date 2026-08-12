import PublicLayout from '../../components/layout/PublicLayout'
export default function PrivacyPage() {
  return (
    <PublicLayout>
    <div className="min-h-screen bg-canvas-light">
      <div className="pt-32 pb-20">
        <div className="container-narrow max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Kebijakan Privasi</h1>
          <p className="text-text-muted text-sm mb-10">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed">
            <p><strong>Logika Kreatif Indonesia (Logikraf)</strong> menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi yang Anda berikan. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga data Anda.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">1. Data yang Kami Kumpulkan</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Informasi Identitas:</strong> Nama lengkap, nama perusahaan, email, dan nomor telepon.</li>
              <li><strong>Informasi Transaksi:</strong> Riwayat pemesanan proyek, paket langganan SaaS, dan detail tagihan (invoice). Kami <strong>tidak</strong> menyimpan data kartu kredit Anda; semua pemrosesan kartu kredit ditangani langsung oleh gerbang pembayaran berlisensi kami.</li>
              <li><strong>Informasi Penggunaan SaaS:</strong> Log aktivitas, metrik penggunaan, dan alamat IP saat Anda menggunakan produk perangkat lunak kami untuk keperluan diagnostik dan keamanan.</li>
            </ul>
            <h3 className="text-xl font-bold mt-8 mb-4">2. Bagaimana Kami Menggunakan Data Anda</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Memproses pendaftaran akun (Client Portal atau Akun SaaS).</li>
              <li>Menyediakan layanan, dukungan teknis, dan laporan pengerjaan proyek.</li>
              <li>Memproses tagihan dan meneruskan data identitas dasar ke Payment Gateway.</li>
              <li>Mengirimkan pemberitahuan penting seperti downtime pemeliharaan server, pembaruan Syarat & Ketentuan, atau tagihan jatuh tempo.</li>
            </ul>
            <h3 className="text-xl font-bold mt-8 mb-4">3. Penyebaran Data ke Pihak Ketiga</h3>
            <p>Kami tidak akan pernah menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran. Data hanya dibagikan kepada mitra operasional esensial sebatas untuk keperluan kelancaran layanan kami.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">4. Keamanan Data</h3>
            <p>Kami mengimplementasikan langkah-langkah keamanan teknis standar industri (termasuk enkripsi password menggunakan bcrypt dan protokol SSL/HTTPS) untuk mencegah akses yang tidak sah. Data bisnis rahasia yang Anda berikan dalam kapasitas pengerjaan proyek akan dijaga kerahasiaannya.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">5. Hak Anda atas Data Anda</h3>
            <p>Anda memiliki hak untuk meminta salinan data Anda yang tersimpan di sistem kami, atau meminta penghapusan permanen atas akun Anda. Untuk melakukannya, silakan ajukan permohonan melalui email resmi ke <strong>support@logikraf.id</strong>.</p>
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}
