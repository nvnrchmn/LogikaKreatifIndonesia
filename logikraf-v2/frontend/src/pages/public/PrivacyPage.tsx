import { useEffect, useState, type ReactNode } from 'react'
import { LegalIdentity, LegalUpdated, useLegalInfo } from '../../hooks/useLegal'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway {
  id: string
  name: string
  policies: string
}

export default function PrivacyPage() {
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
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Kebijakan Privasi</h1>
            <LegalUpdated />

            <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed space-y-6">
              <p>
                <strong>{info.entity}</strong>{info.form ? ` (${info.form})` : ''} berkomitmen melindungi data pribadi
                pengunjung, klien, dan pengguna layanan kami. Kebijakan ini menjelaskan data apa yang kami kumpulkan,
                untuk apa digunakan, berapa lama disimpan, dan hak Anda atas data tersebut.
              </p>

              <H n="1">Dasar Hukum &amp; Ruang Lingkup</H>
              <p className="text-sm">
                Kebijakan ini disusun dengan mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi
                serta peraturan pelaksanaannya, dan berlaku atas data yang kami proses melalui situs, portal klien,
                maupun kanal komunikasi resmi kami.
              </p>

              <H n="2">Data yang Kami Kumpulkan</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Identitas &amp; kontak:</strong> nama, nama badan usaha, alamat email, nomor WhatsApp/telepon, dan alamat yang Anda isikan saat menghubungi kami atau memesan layanan.</li>
                <li><strong>Data transaksi &amp; tagihan:</strong> nomor referensi pesanan, paket yang dipilih, nominal, dan status pembayaran. Data ini menjadi bagian dari dokumen penagihan dan riwayat transaksi Anda.</li>
                <li><strong>Data teknis terbatas:</strong> waktu akses dan alamat IP tercatat pada log server untuk keperluan keamanan dan pencegahan penyalahgunaan.</li>
                <li><strong>Data yang TIDAK kami simpan:</strong> kami tidak pernah menerima atau menyimpan kredensial perbankan (PIN, password mobile banking, OTP), data kartu, atau data biometrik Anda. Semua pembayaran diproses langsung oleh gerbang pembayaran berlisensi.</li>
              </ul>

              <H n="3">Tujuan &amp; Dasar Pemrosesan</H>
              <p className="text-sm">Data Anda kami proses untuk:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li>Melaksanakan perjanjian layanan: memproses pesanan, menerbitkan invoice, dan mengerjakan proyek.</li>
                <li>Memverifikasi transaksi melalui notifikasi resmi (webhook) gerbang pembayaran.</li>
                <li>Mengirim pemberitahuan terkait pesanan: konfirmasi pembayaran, pengingat tagihan, pembaruan status pekerjaan, dan informasi pengembalian dana bila berlaku.</li>
                <li>Memenuhi kewajiban hukum kami, termasuk pembukuan, perpajakan, dan penanganan sengketa.</li>
                <li>Menjaga keamanan layanan, termasuk pencegahan penyalahgunaan dan penipuan.</li>
              </ul>
              <p className="text-sm">
                Kami <strong>tidak menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada pihak lain.
              </p>

              <H n="4">Gerbang Pembayaran Resmi</H>
              <p className="text-sm">
                Pembayaran diproses melalui mitra gerbang pembayaran resmi berlisensi Bank Indonesia. Data yang Anda
                masukkan pada halaman pembayaran diproses oleh mitra tersebut sesuai kebijakan privasi mereka:
              </p>

              <div className="bg-canvas-light p-5 rounded-xl border border-border-minimal my-4">
                <h4 className="font-semibold text-text-main text-sm mb-2.5">Penyedia Gerbang Pembayaran Aktif:</h4>
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

              <H n="5">Pihak Ketiga &amp; Layanan yang Kami Gunakan</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Gerbang pembayaran</strong> berlisensi Bank Indonesia untuk memproses QRIS/transfer virtual account.</li>
                <li><strong>Layanan email dan WhatsApp</strong> yang kami operasikan sendiri untuk mengirim invoice, pengingat, dan pemberitahuan pesanan.</li>
                <li><strong>Penyedia infrastruktur server</strong> tempat data kami disimpan di pusat data, termasuk pencadangan (backup) berkala.</li>
              </ul>
              <p className="text-sm">
                Kami hanya memberikan data kepada pihak ketiga sejauh diperlukan untuk menjalankan layanan di atas,
                atau apabila diwajibkan oleh peraturan perundang-undangan atau permintaan resmi aparat berwenang.
              </p>

              <H n="6">Penyimpanan &amp; Retensi</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Data transaksi &amp; dokumen penagihan</strong> kami simpan minimal <strong>10 (sepuluh) tahun</strong> sesuai kewajiban penyimpanan dokumen perusahaan dan perpajakan.</li>
                <li><strong>Data akun portal klien</strong> disimpan selama akun aktif, dan dihapus atau dianonimkan dalam waktu wajar setelah akun tidak lagi digunakan.</li>
                <li><strong>Log teknis</strong> disimpan dalam periode terbatas untuk keamanan, lalu dihapus secara berkala.</li>
              </ul>

              <H n="7">Keamanan Data</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Seluruh lalu lintas data antara browser Anda dan server kami dienkripsi dengan HTTPS/TLS (sertifikat SSL resmi).</li>
                <li>Kata sandi akun disimpan dalam bentuk <strong>hash</strong> (bcrypt) — kami tidak pernah menyimpan kata sandi dalam bentuk teks asli dan tidak dapat membacanya.</li>
                <li>Akses ke data operasional dibatasi pada staf berwenang melalui sesi terautentikasi (token JWT) dan tercatat pada log sistem.</li>
                <li>Kami melakukan pencadangan data berkala untuk mencegah kehilangan data akibat gangguan teknis.</li>
              </ul>

              <H n="8">Hak Anda</H>
              <p className="text-sm">Sesuai peraturan pelindungan data pribadi, Anda berhak:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm">
                <li>Memperoleh informasi dan <strong>akses</strong> atas data pribadi Anda yang kami simpan.</li>
                <li>Meminta <strong>koreksi</strong> atas data yang tidak akurat atau tidak mutakhir.</li>
                <li>Meminta <strong>penghapusan</strong> data, sepanjang tidak bertentangan dengan kewajiban hukum kami menyimpan dokumen transaksi.</li>
                <li><strong>Menarik persetujuan</strong> atau mengajukan keberatan atas pemrosesan tertentu.</li>
              </ul>
              <p className="text-sm">
                Permohonan dapat diajukan melalui email <strong>{info.email}</strong> atau WhatsApp <strong>{info.wa}</strong>
                dengan menyebutkan identitas dan data yang dimaksud. Kami akan menindaklanjuti dalam waktu maksimal
                14 (empat belas) hari kerja.
              </p>

              <H n="9">Cookie &amp; Penyimpanan Lokal Browser</H>
              <p className="text-sm">
                Kami menggunakan penyimpanan lokal browser (localStorage) hanya untuk keperluan fungsional, yaitu menjaga
                sesi login Anda pada portal klien dan menyimpan preferensi tampilan. Kami tidak menggunakan data tersebut
                untuk periklanan pihak ketiga.
              </p>

              <H n="10">Pengguna di Bawah Umur</H>
              <p className="text-sm">
                Layanan kami ditujukan untuk pelaku usaha dan pengguna berusia minimal 18 tahun. Kami tidak dengan sengaja
                mengumpulkan data anak di bawah umur.
              </p>

              <H n="11">Perubahan Kebijakan</H>
              <p className="text-sm">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Versi yang berlaku adalah versi terbaru
                pada halaman ini, dengan tanggal pembaruan yang tercantum di bagian atas halaman dan <strong>tidak berubah
                mengikuti waktu akses</strong>.
              </p>

              <H n="12">Kontak Perlindungan Data</H>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Email:</strong> {info.email}</li>
                <li><strong>WhatsApp:</strong> {info.wa}</li>
                <li><strong>Alamat:</strong> {info.address}</li>
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
