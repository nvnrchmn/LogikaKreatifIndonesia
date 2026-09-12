import { useEffect, useState, type ReactNode } from 'react'
import { LegalIdentity, LegalUpdated, useLegalInfo } from '../../hooks/useLegal'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway {
  id: string
  name: string
  policies: string
}

export default function RefundPolicyPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const info = useLegalInfo()

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))
  }, [])

  const waNumber = info.wa.replace(/[^0-9]/g, '')

  const H = ({ n, children }: { n: string; children: ReactNode }) => (
    <h3 className="text-xl font-bold text-text-main mt-8 mb-3">{n}. {children}</h3>
  )

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Kebijakan Pengembalian Dana</h1>
            <LegalUpdated />

            <div className="prose prose-blue max-w-none text-text-main font-body leading-relaxed space-y-6">
              <p>
                <strong>{info.entity}</strong> berkomitmen pada transparansi penanganan pembayaran. Kebijakan ini berlaku
                untuk seluruh transaksi melalui situs kami, termasuk pembayaran paket layanan dengan QRIS maupun transfer
                virtual account, dan merupakan bagian tidak terpisahkan dari Syarat &amp; Ketentuan kami.
              </p>
              <p className="text-sm">
                <strong>Catatan proses:</strong> karena dana QRIS/transfer diterima melalui gerbang pembayaran berlisensi,
                pengembalian dana kami proses <strong>secara manual oleh tim keuangan dalam dua tahap</strong> — verifikasi
                transaksi, lalu transfer pengembalian ke rekening pemesan. Dana tidak otomatis kembali dengan sendirinya.
              </p>

              <H n="1">Kriteria Pengajuan yang Kami Setujui</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Pembayaran ganda</strong> (terbayar dua kali untuk satu pesanan yang sama) — dikembalikan penuh tanpa potongan.</li>
                <li><strong>Kelebihan bayar</strong> dari nominal invoice — dikembalikan penuh tanpa potongan.</li>
                <li><strong>Pembatalan pesanan</strong> yang diajukan maksimal <strong>1 x 24 jam</strong> setelah pembayaran dan sebelum pekerjaan dimulai.</li>
                <li><strong>Pembayaran tanpa pesanan yang sah</strong> (tidak ada nomor referensi yang cocok di sistem kami).</li>
                <li><strong>Kegagalan dari pihak kami</strong> dalam memenuhi lingkup pekerjaan yang disepakati, dan tidak dapat diselesaikan melalui perbaikan.</li>
              </ul>

              <H n="2">Ketentuan yang Tidak Dapat Dikembalikan</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Pekerjaan yang <strong>sudah dimulai atau berjalan</strong> sesuai lingkup yang disepakati.</li>
                <li>Pembatalan sepihak setelah fase analisis/pengerjaan dimulai, tanpa alasan yang sah menurut perjanjian.</li>
                <li>Perubahan lingkup (scope) pekerjaan setelah proyek berjalan.</li>
                <li><strong>Biaya pihak ketiga yang sudah dibelanjakan</strong> atas nama Klien, misalnya domain, hosting, layanan langganan, atau lisensi.</li>
                <li><strong>Biaya layanan gerbang pembayaran</strong> yang telah dipotong oleh penyedia pembayaran.</li>
              </ul>

              <H n="3">Prosedur Pengajuan (Dua Tahap)</H>
              <p className="text-sm"><strong>Tahap 1 — Verifikasi (1–2 hari kerja)</strong></p>
              <ol className="list-decimal pl-6 space-y-2 text-sm">
                <li>Klien menghubungi kami melalui email <strong>{info.email}</strong> atau WhatsApp <strong>{info.wa}</strong> dengan menyertakan: nomor pesanan/referensi, bukti pembayaran, dan alasan pengajuan.</li>
                <li>Tim kami memeriksa transaksi pada sistem gerbang pembayaran resmi dan mencocokkannya dengan catatan pesanan.</li>
                <li>Hasil verifikasi (disetujui atau tidak, beserta alasannya) kami sampaikan melalui email/WhatsApp.</li>
              </ol>
              <p className="text-sm"><strong>Tahap 2 — Pengembalian Dana (3–7 hari kerja setelah disetujui)</strong></p>
              <ol className="list-decimal pl-6 space-y-2 text-sm" start={4}>
                <li>Tim keuangan memproses transfer pengembalian ke rekening bank atau e-wallet <strong>atas nama pemesan</strong>.</li>
                <li>Untuk pengembalian ke rekening yang berbeda dari sumber pembayaran, kami dapat meminta verifikasi identitas tambahan.</li>
                <li>Bukti transfer pengembalian kami kirimkan kepada Klien sebagai penyelesaian perkara.</li>
              </ol>

              <H n="4">Batas Waktu Pengajuan</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Kasus pembatalan sebelum pekerjaan dimulai: maksimal <strong>7 hari kalender</strong> sejak tanggal pembayaran.</li>
                <li>Kasus pembayaran ganda atau kelebihan bayar: kapan saja, selama bukti transaksi dan nomor referensi dapat diverifikasi.</li>
              </ul>

              <H n="5">Metode &amp; Biaya</H>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Pengembalian dilakukan melalui transfer bank/e-wallet ke rekening atas nama pemesan.</li>
                <li>Biaya transfer bank dan biaya layanan gerbang pembayaran yang sudah terpotong tidak dapat dikembalikan; untuk kasus pembayaran ganda dan kelebihan bayar, dana dikembalikan <strong>penuh</strong> sesuai nominal yang Anda bayarkan.</li>
                <li>Kesalahan data rekening yang diberikan Klien menjadi tanggung jawab Klien, termasuk biaya transfer ulang bila ada.</li>
              </ul>

              <H n="6">Jika Pengajuan Tidak Disetujui</H>
              <p className="text-sm">
                Kami menyampaikan alasan penolakan secara tertulis. Klien dapat mengajukan peninjauan ulang dengan
                melampirkan bukti tambahan, atau menyelesaikan perselisihan sesuai klausul penyelesaian sengketa pada
                Syarat &amp; Ketentuan.
              </p>

              <H n="7">Gerbang Pembayaran Resmi</H>
              <div className="bg-canvas-light p-5 rounded-xl border border-border-minimal my-4">
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

              <H n="8">Kontak Layanan Resmi</H>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Email:</strong> {info.email}</li>
                <li><strong>WhatsApp helpdesk:</strong> {info.wa}</li>
                <li><strong>Jam layanan:</strong> {info.hours}</li>
                <li><strong>Situs:</strong> https://logikraf.id</li>
              </ul>
              <p className="text-xs text-text-muted pt-4">
                Dengan melakukan pembayaran melalui platform kami, Anda dianggap telah membaca, memahami, dan menyetujui
                kebijakan pengembalian dana ini. Tautan WhatsApp helpdesk: https://wa.me/{waNumber}
              </p>
            </div>
          </div>
        </div>
        <LegalIdentity />
      </div>
    </PublicLayout>
  )
}
