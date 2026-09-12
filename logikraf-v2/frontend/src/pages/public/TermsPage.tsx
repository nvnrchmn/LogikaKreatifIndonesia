import { useEffect, useState, type ReactNode } from 'react'
import { LegalIdentity, LegalUpdated, useLegalInfo } from '../../hooks/useLegal'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway {
  id: string
  name: string
  policies: string
}

export default function TermsPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const info = useLegalInfo()

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))
  }, [])

  const H = ({ n, children }: { n: string; children: ReactNode }) => (
    <h3 className="text-xl font-bold text-text-main mt-8 mb-3">{n}. {children}</h3>
  )

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Syarat &amp; Ketentuan</h1>
            <LegalUpdated />

            <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed space-y-6">
              <p>
                Syarat dan Ketentuan ini mengatur penggunaan situs dan layanan <strong>{info.entity}</strong>
                {info.form ? ` (${info.form})` : ''} — selanjutnya disebut &ldquo;Logikraf&rdquo;, &ldquo;kami&rdquo;.
                Dengan melakukan pemesanan atau pembayaran melalui situs ini, Anda (&ldquo;Klien&rdquo;) menyatakan
                telah membaca, memahami, dan menyetujui seluruh ketentuan berikut.
              </p>

              <H n="1">Ruang Lingkup Layanan</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Logikraf menyediakan jasa pengembangan produk digital: situs web, sistem/admin panel, integrasi pembayaran, dan layanan pendukung lain yang ditawarkan pada halaman paket.</li>
                <li>Paket yang dipesan menentukan lingkup pekerjaan, jumlah halaman/fitur, dan durasi pengerjaan sebagaimana dijelaskan pada deskripsi paket saat pemesanan.</li>
                <li>Permintaan di luar lingkup paket diperlakukan sebagai pekerjaan tambahan dan akan ditawarkan terpisah sebelum dikerjakan.</li>
              </ul>

              <H n="2">Pemesanan &amp; Pembayaran</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Pemesanan dilakukan melalui situs ini. Setelah pemesanan, sistem menerbitkan invoice dengan nomor referensi resmi.</li>
                <li>Pembayaran diproses melalui gerbang pembayaran resmi berlisensi Bank Indonesia (QRIS/transfer virtual account). Kami tidak menyimpan kredensial perbankan, PIN, atau data kartu Anda.</li>
                <li>Pesanan dinyatakan sah setelah pembayaran <strong>terverifikasi secara otomatis oleh sistem</strong> melalui notifikasi resmi gerbang pembayaran. Invoice/kwitansi dikirim ke email yang Anda daftarkan.</li>
                <li>Tagihan yang belum diselesaikan akan menerima pengingat melalui email dan/atau WhatsApp. Pekerjaan dimulai setelah pembayaran terverifikasi.</li>
              </ul>

              <div className="bg-canvas-light p-5 rounded-xl border border-border-minimal my-4">
                <h4 className="font-semibold text-text-main text-sm mb-2.5">Gerbang Pembayaran Aktif:</h4>
                {gateways.length === 0 ? (
                  <p className="text-text-muted text-xs">Pembayaran diproses melalui gerbang pembayaran resmi yang diawasi Bank Indonesia dengan enkripsi SSL.</p>
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

              <H n="3">Jadwal &amp; Kewajiban Klien</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Jadwal pengerjaan dimulai sejak pembayaran terverifikasi dan materi awal diterima (kickoff).</li>
                <li>Klien menyediakan materi yang dibutuhkan tepat waktu: profil usaha, daftar layanan/harga, logo dan aset merek, foto, akses domain/hosting (bila ada), serta data penagihan.</li>
                <li>Keterlambatan penyerahan materi atau umpan balik akan menggeser jadwal penyelesaian secara proporsional.</li>
                <li>Klien menunjuk satu PIC yang berwenang menyetujui hasil pekerjaan.</li>
              </ul>

              <H n="4">Revisi &amp; Perubahan Lingkup</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Setiap tahap pekerjaan mencakup <strong>2 (dua) putaran revisi</strong> untuk penyesuaian dalam lingkup yang disepakati.</li>
                <li>Revisi di luar lingkup, perubahan struktur besar, atau penggantian konsep setelah disetujui diperlakukan sebagai pekerjaan tambahan.</li>
              </ul>

              <H n="5">Hasil Pekerjaan &amp; Kepemilikan</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Hak penggunaan hasil pekerjaan (kode, desain, dan materi yang kami buat) beralih kepada Klien <strong>setelah pelunasan penuh</strong>.</li>
                <li>Komponen pihak ketiga (pustaka open source, layanan pihak ketiga) tetap tunduk pada lisensi dan ketentuan masing-masing.</li>
                <li>Kami berhak menampilkan hasil pekerjaan sebagai portofolio, kecuali Klien meminta sebaliknya secara tertulis.</li>
                <li>Data dan akun Klien dapat kami simpan sebagai bagian dari riwayat transaksi sesuai kewajiban pembukuan.</li>
              </ul>

              <H n="6">Layanan Pasca-Serah</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Kami memberikan perbaikan tanpa biaya untuk <strong>kesalahan/bug</strong> pada hasil pekerjaan dalam <strong>30 (tiga puluh) hari</strong> setelah serah terima.</li>
                <li>Biaya domain, hosting, layanan pihak ketiga, serta pemeliharaan dan pengembangan lanjutan berada di luar lingkup paket dan ditagihkan terpisah.</li>
              </ul>

              <H n="7">Kerahasiaan</H>
              <p className="text-sm">
                Kedua pihak menjaga kerahasiaan informasi non-publik yang dipertukarkan selama proyek. Informasi hanya digunakan untuk pelaksanaan pekerjaan dan tidak dibuka kepada pihak lain tanpa persetujuan, kecuali diwajibkan peraturan perundang-undangan.
              </p>

              <H n="8">Batasan Tanggung Jawab</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Kami mengerjakan pekerjaan secara profesional, namun tidak menjamin hasil bisnis tertentu (misalnya angka penjualan atau peringkat mesin pencari).</li>
                <li>Tanggung jawab kami atas suatu transaksi dibatasi maksimal sebesar nilai transaksi terkait.</li>
                <li>Kami tidak bertanggung jawab atas gangguan yang disebabkan layanan pihak ketiga di luar kendali kami (penyedia domain, hosting, jaringan, atau gerbang pembayaran).</li>
              </ul>

              <H n="9">Pembatalan &amp; Pengembalian Dana</H>
              <p className="text-sm">
                Ketentuan pembatalan dan pengembalian dana mengikuti <strong>Kebijakan Pengembalian Dana</strong> kami, yang merupakan bagian tidak terpisahkan dari Syarat dan Ketentuan ini.
              </p>

              <H n="10">Keadaan Memaksa (Force Majeure)</H>
              <p className="text-sm">
                Kami tidak dianggap lalai atas keterlambatan atau kegagalan yang disebabkan keadaan di luar kendali wajar kami, termasuk bencana alam, gangguan jaringan/listrik nasional, perubahan kebijakan pemerintah, atau gangguan penyedia layanan pihak ketiga.
              </p>

              <H n="11">Perubahan Ketentuan</H>
              <p className="text-sm">
                Kami dapat memperbarui Syarat dan Ketentuan ini. Versi yang berlaku adalah versi terbaru yang ditampilkan di halaman ini; tanggal pembaruan tercantum di bagian atas halaman dan <strong>tidak berubah mengikuti waktu akses</strong>. Perubahan material akan diberitahukan melalui email atau WhatsApp kepada Klien yang sedang dalam masa pengerjaan.
              </p>

              <H n="12">Hukum yang Berlaku &amp; Penyelesaian Sengketa</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Syarat dan Ketentuan ini tunduk pada hukum Republik Indonesia.</li>
                <li>Setiap perselisihan diupayakan diselesaikan secara musyawarah terlebih dahulu dalam waktu 30 (tiga puluh) hari.</li>
                <li>Apabila musyawarah tidak mencapai kesepakatan, penyelesaian dilakukan melalui pengadilan yang berwenang di wilayah domisili kami.</li>
              </ul>

              <H n="13">Kontak Resmi</H>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Email:</strong> {info.email}</li>
                <li><strong>WhatsApp helpdesk:</strong> {info.wa}</li>
                <li><strong>Jam layanan:</strong> {info.hours}</li>
              </ul>
            </div>
          </div>
        </div>
        <LegalIdentity />
      </div>
    </PublicLayout>
  )
}
