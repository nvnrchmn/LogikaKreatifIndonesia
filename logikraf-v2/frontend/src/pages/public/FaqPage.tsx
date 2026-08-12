import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Gateway { id: string; name: string; policies: string }

const staticFaqs = [
  {
    q: 'Bagaimana jika pembayaran saya gagal diproses?',
    a: 'Cek kembali saldo atau limit e-wallet/kartu Anda, lalu coba metode lain. Jika masih gagal, hubungi tim kami melalui halaman Kontak dengan menyertakan ID transaksi.',
  },
  {
    q: 'Apakah bisa mencicil pembayaran proyek?',
    a: 'Untuk Layanan IT Solutions, kami menerapkan sistem termin berdasarkan milestone. Detail cicilan dibahas saat kontrak proyek.',
  },
  {
    q: 'Apakah ada biaya tambahan dari payment gateway?',
    a: 'Biaya admin gateway sudah termasuk dalam total tagihan yang tercantum, kecuali ada ketentuan khusus pada paket tertentu.',
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
