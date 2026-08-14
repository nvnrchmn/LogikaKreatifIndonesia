import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway {
  id: string
  name: string
  policies: string
}

export default function FaqPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => {
        setGateways(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => {
        setGateways([])
        setLoading(false)
      })
  }, [])

  const gatewayNames = gateways.map(g => g.name).join(' & ') || 'iPaymu'

  const qrisFaqs = [
    {
      q: 'Metode pembayaran apa saja yang diterima di Logikraf?',
      a: `Logikraf melayani pembayaran menggunakan QRIS (Quick Response Code Indonesian Standard) yang diproses secara aman melalui gerbang pembayaran resmi ${gatewayNames}. Anda dapat memindai QR code dari aplikasi Mobile Banking apapun (BCA Mobile, Livin' Mandiri, BRImo, BNI Mobile, OCTO Mobile, dll.) maupun E-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja).`,
    },
    {
      q: 'Bagaimana cara melakukan pembayaran dengan QRIS?',
      a: 'Setelah memilih paket layanan di halaman checkout, sistem akan membuat invoice dan menampilkan kode QRIS Dinamis. Buka aplikasi m-Banking atau dompet digital Anda, pilih menu Scan / QRIS, arahkan kamera ke kode QR di layar, lalu konfirmasi pembayaran sesuai nominal yang tertera.',
    },
    {
      q: 'Berapa lama waktu verifikasi pembayaran setelah saya scan QRIS?',
      a: `Verifikasi pembayaran berlangsung instan secara real-time melalui webhook otomatis ${gatewayNames}. Begitu pembayaran Anda berhasil di aplikasi bank/e-wallet, status pesanan di sistem kami akan langsung berubah menjadi "Success / Terverifikasi" dalam hitungan detik.`,
    },
    {
      q: 'Apakah pembayaran QRIS di Logikraf aman?',
      a: `Sangat aman. Jalur transaksi kami terintegrasi langsung dengan ${gatewayNames} yang memiliki lisensi resmi Penyelenggara Jasa Pembayaran (PJP) dari Bank Indonesia. Seluruh proses transfer terenkripsi SSL 256-bit standar industri perbankan dan data akun Anda tidak pernah disimpan di server kami.`,
    },
    {
      q: 'Bagaimana jika kode QRIS saya kedaluwarsa (Expired)?',
      a: 'Setiap kode QRIS memiliki batas waktu berlaku demi keamanan transaksi. Jika kode QRIS kedaluwarsa sebelum sempat dipindai, Anda cukup mengulang proses checkout di halaman Paket Layanan untuk mendapatkan kode QRIS baru yang masih aktif.',
    },
    {
      q: 'Bagaimana kebijakan pengembalian dana (Refund) untuk pembayaran QRIS?',
      a: 'Jika terjadi kesalahan sistem atau pembayaran ganda (double payment), dana Anda dapat dikembalikan. Silakan kirimkan bukti transaksi QRIS dan nomor pesanan ke email support@logikraf.id atau WhatsApp Helpdesk. Proses verifikasi berlangsung 1-2 hari kerja dan pencairan dana kembali ke rekening/e-wallet Anda memakan waktu 3-7 hari kerja.',
    },
    {
      q: 'Apakah ada biaya tambahan saat membayar dengan QRIS?',
      a: 'Tidak ada biaya tersembunyi. Total nominal yang harus dibayar saat Anda memindai kode QRIS adalah nominal pasti yang tertera pada invoice digital Anda.',
    },
  ]

  // Dynamic Gateway-specific FAQs
  const dynamicGatewayFaqs = gateways.map(g => ({
    q: `Bagaimana kebijakan resmi gerbang pembayaran ${g.name}?`,
    a: g.policies,
  }))

  const allFaqs = [...qrisFaqs, ...dynamicGatewayFaqs]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow max-w-3xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold w-fit mb-4">
              <span>⚡ Pembayaran Digital Instan QRIS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-2">Pertanyaan Umum (FAQ)</h1>
            <p className="text-text-muted text-sm mb-10">
              Informasi lengkap seputar layanan, alur pemesanan, dan metode pembayaran QRIS resmi di Logikraf.
            </p>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border border-border-minimal rounded-xl p-5 animate-pulse bg-gray-50 h-20" />
                ))
              ) : (
                allFaqs.map((f, i) => (
                  <details
                    key={i}
                    className="group border border-border-minimal rounded-xl p-5 open:bg-canvas-light/60 transition-colors"
                  >
                    <summary className="flex items-center justify-between cursor-pointer font-display font-semibold text-text-main list-none">
                      <span className="pr-4 text-sm sm:text-base">{f.q}</span>
                      <svg
                        className="w-5 h-5 text-text-muted shrink-0 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-3 text-text-muted text-xs sm:text-sm leading-relaxed font-body border-t border-border-minimal/50 pt-3">
                      {f.a}
                    </p>
                  </details>
                ))
              )}
            </div>

            {/* Support CTA */}
            <div className="mt-10 p-6 bg-canvas-light rounded-2xl border border-border-minimal flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-text-main text-sm">Masih punya pertanyaan lain?</h3>
                <p className="text-xs text-text-muted mt-0.5">Tim helpdesk kami siap membantu kendala transaksi atau konsultasi proyek.</p>
              </div>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs py-2 px-4 shrink-0 whitespace-nowrap"
              >
                💬 Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
