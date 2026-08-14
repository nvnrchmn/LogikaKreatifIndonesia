import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway { id: string; name: string; policies: string }

const staticFaqs = [
  {
    q: 'Metode pembayaran apa saja yang didukung oleh Logikraf?',
    a: 'Kami menerima pembayaran melalui gerbang pembayaran resmi iPaymu, Midtrans, dan Xendit. Anda dapat membayar menggunakan Transfer Virtual Account (BCA, Mandiri, BNI, BRI, Permata, CIMB Niaga, Danamon), QRIS (GoPay, OVO, DANA, ShopeePay, LinkAja), Gerai Alfamart/Indomaret, serta Kartu Kredit/Debit berlogo Visa dan MasterCard.',
  },
  {
    q: 'Berapa lama proses verifikasi pembayaran saya?',
    a: 'Semua transaksi via Virtual Account, QRIS, dan E-Wallet diverifikasi secara otomatis dan instan (real-time). Anda akan langsung mendapatkan notifikasi konfirmasi serta invoice digital segera setelah transfer berhasil.',
  },
  {
    q: 'Bagaimana prosedur jika saya ingin mengajukan pengembalian dana (Refund)?',
    a: 'Jika terjadi pembayaran ganda atau pembatalan sebelum proyek/paket diproses (maksimal 1x24 jam), silakan hubungi tim kami via email support@logikraf.id atau WhatsApp ke +62 812-3456-7890 dengan menyertakan Nomor Invoice dan Bukti Transfer. Proses refund akan diverifikasi dalam 1-2 hari kerja dan dicairkan dalam 3-7 hari kerja.',
  },
  {
    q: 'Apakah transaksi pembayaran di Logikraf aman?',
    a: 'Sangat aman. Seluruh jalur transaksi dilindungi oleh enkripsi SSL 256-bit dan diproses melalui payment gateway berlisensi resmi Bank Indonesia. Kami tidak pernah menyimpan data nomor kartu atau kredensial perbankan Anda di server kami.',
  },
  {
    q: 'Bagaimana jika pembayaran saya gagal atau kedaluwarsa (Expired)?',
    a: 'Nomor Virtual Account atau kode QRIS memiliki batas waktu pembayaran. Jika transaksi kedaluwarsa sebelum Anda transfer, Anda dapat mengulang proses pemesanan untuk mendapatkan kode pembayaran baru. Jika saldo sudah terpotong namun status belum berubah, hubungi kami beserta bukti mutasi bank.',
  },
  {
    q: 'Apakah bisa melakukan pembayaran bertahap (Milestone / Termin)?',
    a: 'Ya, khusus untuk Layanan IT Solutions dan Custom Software Development, pembayaran dibagi ke dalam termin (misal: Down Payment 30%, Milestone 40%, dan Peluncuran 30%) sesuai kesepakatan kontrak.',
  },
]

export default function FaqPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))
  }, [])

  const names = gateways.map(g => g.name)
  const namesText = names.length ? names.join(' dan ') : 'gerbang pembayaran resmi'
  const dynamicFaqs = [
    {
      q: 'Metode pembayaran apa saja yang didukung?',
      a: `Kami menerima pembayaran melalui ${namesText}. Masing-masing menyediakan transfer bank (Virtual Account), e-wallet, dan kartu kredit/debit sesuai metode yang tersedia.`,
    },
    {
      q: 'Apakah aman membayar melalui payment gateway?',
      a: names.length
        ? `${namesText} adalah payment gateway terdaftar dan tunduk pada regulasi Bank Indonesia. Data kartu tidak disimpan di server kami.`
        : 'Payment gateway kami terdaftar dan tunduk pada regulasi Bank Indonesia. Data kartu tidak disimpan di server kami.',
    },
    ...gateways.map(g => ({
      q: `Kebijakan ${g.name}?`,
      a: g.policies,
    })),
    ...staticFaqs,
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
          <div className="container-narrow max-w-3xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border-minimal">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-2">Pertanyaan Umum (FAQ)</h1>
            <p className="text-text-muted text-sm mb-10">Seputar layanan, pembayaran, dan metode yang kami gunakan.</p>
            <div className="space-y-4">
              {dynamicFaqs.map((f, i) => (
                <details key={i} className="group border border-border-minimal rounded-xl p-5 open:bg-canvas-light transition-colors">
                  <summary className="flex items-center justify-between cursor-pointer font-display font-semibold text-text-main list-none">
                    <span>{f.q}</span>
                    <svg className="w-5 h-5 text-text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <p className="mt-3 text-text-muted text-sm leading-relaxed font-body">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
