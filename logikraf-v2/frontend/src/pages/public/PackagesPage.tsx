import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Package {
  id: number
  name: string
  tagline: string
  price: number
  formatted_price: string
  features: string[]
  is_featured: boolean
  slug: string
  sort_order: number
}

export default function PackagesPage() {
  const [searchParams] = useSearchParams()
  const paid = searchParams.get('status') === 'success'
  const [items, setItems] = useState<Package[]>([])
  const [gateways, setGateways] = useState<{ id: string; name: string }[]>([])
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length) {
          setItems(data.map(p => ({ ...p, features: Array.isArray(p.features) ? p.features : (p.features || '').split('\n').filter(Boolean) })))
        }
      })
      .catch(() => {})

    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d.map((g: any) => ({ id: g.id, name: g.name })) : []))
      .catch(() => setGateways([]))
  }, [])

  // Default rich fallback packages if database is fresh
  const displayPackages: Package[] = useMemo(() => {
    if (items.length > 0) return [...items].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))
    return [
      {
        id: 1,
        name: 'Logikraf Starter',
        tagline: 'Paket dasar untuk profil bisnis & landing page profesional yang langsung go-digital.',
        price: 2499000,
        formatted_price: 'Rp 2.499.000',
        is_featured: false,
        slug: 'logikraf-starter',
        sort_order: 1,
        features: [
          'Landing page',
          'Profil bisnis',
          'Produk / jasa',
          'Galeri',
          'Kontak',
          'Google Maps',
          'WhatsApp CTA',
          'Social media links',
          'SEO basic',
          'Mobile responsive',
          'SSL',
          'Hosting',
          'CMS sederhana',
        ],
      },
      {
        id: 2,
        name: 'Logikraf Business',
        tagline: 'Tingkatkan dengan katalog produk, blog, hingga manajemen lead & customer terpusat.',
        price: 4999000,
        formatted_price: 'Rp 4.999.000',
        is_featured: true,
        slug: 'logikraf-business',
        sort_order: 2,
        features: [
          'Semua fitur Starter',
          'Katalog produk',
          'Kategori produk',
          'Form order',
          'Booking',
          'Artikel / blog',
          'Promo',
          'Customer database',
          'Dashboard admin',
          'Analytics',
          'Lead management',
          'Notification',
        ],
      },
      {
        id: 3,
        name: 'Logikraf Commerce',
        tagline: 'Toko online lengkap dengan payment gateway, inventori, hingga laporan penjualan.',
        price: 9999000,
        formatted_price: 'Rp 9.999.000',
        is_featured: false,
        slug: 'logikraf-commerce',
        sort_order: 3,
        features: [
          'Semua fitur Business',
          'Online order',
          'Cart',
          'Checkout',
          'Payment gateway',
          'Invoice',
          'Customer management',
          'Inventory',
          'Order management',
          'Sales report',
          'Payment report',
          'Promo / voucher',
          'Product variants',
          'Shipping integration',
        ],
      },
    ]
  }, [items])

  const openCheckout = (pkg: Package) => {
    setSelectedPkg(pkg)
    setErr('')
    setCheckoutModalOpen(true)
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPkg) return
    setBusy(true)
    setErr('')

    const gw = gateways.length > 0 ? gateways[0] : { id: 'ipaymu', name: 'iPaymu' }
    const endpoint = gw.id === 'xendit' ? '/api/payment/xendit/invoice' : `/api/payment/${gw.id}/snap`
    const payload = {
      order_id: `LK-${Date.now()}-${selectedPkg.id}`,
      amount: Number(selectedPkg.price),
      first_name: form.name,
      email: form.email,
      phone: form.phone,
      description: `Paket ${selectedPkg.name} - Logikraf`,
      paymentMethod: 'qris',
      paymentChannel: 'qris',
    }

    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || data?.Message || 'Gagal memproses pembuatan transaksi')
      const url = data.redirect_url || data.invoice_url || data.payment_url || data.Data?.Url || data.url
      if (url) {
        window.location.href = url
      } else if (data.token) {
        alert('Payment Token: ' + data.token)
      } else {
        throw new Error('Tautan pembayaran QRIS tidak ditemukan.')
      }
    } catch (e: any) {
      setErr(e.message || 'Gagal memproses pembayaran. Hubungi admin via WhatsApp.')
    } finally {
      setBusy(false)
    }
  }

  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Ambient Hero Banner */}
        <div className="pt-36 sm:pt-40 pb-24 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            {/* Payment Success Banner */}
            {paid && (
              <div className="max-w-2xl mx-auto mb-12 p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-md text-center space-y-2 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-display font-bold text-lg">Pembayaran QRIS Berhasil Diverifikasi!</h3>
                <p className="text-xs sm:text-sm text-emerald-800">
                  Terima kasih atas pesanan Anda. Tim engineer Logikraf akan segera menginisiasi kick-off proyek dan menghubungi Anda via WhatsApp.
                </p>
                <div className="pt-2">
                  <Link to="/client/orders" className="btn-primary text-xs py-2 px-5 shadow-sm inline-block">
                    Buka Portal Klien Saya →
                  </Link>
                </div>
              </div>
            )}

            {/* Header Title */}
            <div className="text-center max-w-3xl mx-auto mb-12 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Paket Layanan SaaS &amp; Pembuatan Website</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-4 leading-tight">
                Investasi Transparan untuk <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-600 to-indigo-600">
                  Pertumbuhan Bisnis Anda
                </span>
              </h1>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-body">
                Pilih paket pengembangan software atau website UMKM dengan garansi pengerjaan profesional, arsitektur handal, dan pembayaran resmi QRIS.
              </p>
            </div>

            {/* SaaS Pricing Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
              {displayPackages.map((pkg, idx) => {
                const isFeatured = pkg.is_featured
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                      isFeatured
                        ? 'bg-gradient-to-b from-gray-900 to-canvas-dark text-white p-8 lg:p-9 shadow-2xl scale-100 lg:-translate-y-2 border-2 border-brand-primary ring-4 ring-brand-primary/20'
                        : 'bg-white text-text-main p-8 border border-border-minimal shadow-sm hover:shadow-xl'
                    }`}
                  >
                    {isFeatured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                        <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-brand-primary to-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg whitespace-nowrap">
                          ★ Paling Populer
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Package Header */}
                      <div className="mb-6">
                        <h3 className={`text-xl font-display font-extrabold mb-2 ${isFeatured ? 'text-white' : 'text-text-main'}`}>
                          {pkg.name}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isFeatured ? 'text-text-light/70' : 'text-text-muted'}`}>
                          {pkg.tagline}
                        </p>
                      </div>

                      {/* Price Tag */}
                      <div className="mb-8 pb-6 border-b border-border-minimal/40">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl sm:text-4xl font-display font-black tracking-tight ${isFeatured ? 'text-white' : 'text-text-main'}`}>
                            {pkg.formatted_price || fmt(pkg.price)}
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono mt-1 block ${isFeatured ? 'text-brand-accent' : 'text-text-muted'}`}>
                          Satu kali investasi pengerjaan
                        </span>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3.5 mb-8">
                        <span className={`text-[11px] font-bold uppercase tracking-wider block ${isFeatured ? 'text-brand-accent' : 'text-text-muted'}`}>
                          Fitur &amp; Deliverable:
                        </span>
                        {pkg.features &&
                          pkg.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-3 text-xs leading-snug">
                              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                              <span className={isFeatured ? 'text-text-light/90' : 'text-text-main'}>{feat}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-6 border-t border-border-minimal/40 space-y-2">
                      <button
                        type="button"
                        onClick={() => openCheckout(pkg)}
                        className={`w-full py-3 px-6 rounded-2xl font-display font-bold text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 ${
                          isFeatured
                            ? 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/30'
                            : 'bg-canvas-dark hover:bg-black text-white'
                        }`}
                      >
                        <span>Pesan Paket via QRIS Instan ⚡</span>
                      </button>
                      <a
                        href={`https://wa.me/6281234567890?text=Halo%20Logikraf,%20saya%20tertarik%20dengan%20Paket%20${encodeURIComponent(
                          pkg.name
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`block text-center text-[11px] font-semibold transition-colors py-1 ${
                          isFeatured ? 'text-text-light/60 hover:text-white' : 'text-text-muted hover:text-brand-primary'
                        }`}
                      >
                        Tanya Konsultan via WhatsApp →
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Comparison Matrix Table */}
            <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-8 sm:p-10 mb-20">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="font-display font-extrabold text-2xl text-text-main mb-2">
                  Matriks Perbandingan Fitur Paket
                </h3>
                <p className="text-xs text-text-muted">
                  Lihat rincian komparasi teknis dan layanan pendukung di setiap tingkatan paket.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border-minimal text-text-main">
                      <th className="text-left font-bold py-4 px-4">Fitur Teknis</th>
                      <th className="text-center font-bold py-4 px-4">Logikraf Starter</th>
                      <th className="text-center font-bold py-4 px-4 bg-brand-primary/5 text-brand-primary rounded-t-xl">
                        Logikraf Business
                      </th>
                      <th className="text-center font-bold py-4 px-4">Logikraf Commerce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-minimal text-text-muted">
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-text-main">Mobile Responsive &amp; PWA Ready</td>
                      <td className="text-center py-3.5 px-4 text-emerald-600 font-bold">✓</td>
                      <td className="text-center py-3.5 px-4 text-emerald-600 font-bold bg-brand-primary/5">✓</td>
                      <td className="text-center py-3.5 px-4 text-emerald-600 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-text-main">Integrasi Pembayaran QRIS Dinamis</td>
                      <td className="text-center py-3.5 px-4">—</td>
                      <td className="text-center py-3.5 px-4 text-emerald-600 font-bold bg-brand-primary/5">✓ Otomatis</td>
                      <td className="text-center py-3.5 px-4 text-emerald-600 font-bold">✓ Multi-Gateway</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-text-main">Dashboard Admin CMS</td>
                      <td className="text-center py-3.5 px-4">Dasar</td>
                      <td className="text-center py-3.5 px-4 font-bold text-text-main bg-brand-primary/5">Lengkap (E-Commerce)</td>
                      <td className="text-center py-3.5 px-4 font-bold text-text-main">Kustom RBAC</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-text-main">Domain &amp; Cloud Server</td>
                      <td className="text-center py-3.5 px-4">1 Tahun</td>
                      <td className="text-center py-3.5 px-4 font-bold text-text-main bg-brand-primary/5">1 Tahun Premium</td>
                      <td className="text-center py-3.5 px-4 font-bold text-text-main">Dedicated VPC</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-text-main">Garansi Teknis &amp; Bugfix</td>
                      <td className="text-center py-3.5 px-4">3 Bulan</td>
                      <td className="text-center py-3.5 px-4 font-bold text-text-main bg-brand-primary/5">6 Bulan</td>
                      <td className="text-center py-3.5 px-4 font-bold text-text-main">12 Bulan SLA</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-text-main">Hak Cipta &amp; Source Code</td>
                      <td className="text-center py-3.5 px-4">Lisensi Klien</td>
                      <td className="text-center py-3.5 px-4 bg-brand-primary/5">Lisensi Klien</td>
                      <td className="text-center py-3.5 px-4 font-bold text-emerald-600">Kepemilikan Penuh 100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SLA & Guarantee FAQ Accordion */}
            <div className="bg-canvas-overlay rounded-3xl border border-border-minimal p-8 sm:p-12">
              <div className="max-w-2xl mx-auto text-center mb-8">
                <h3 className="font-display font-extrabold text-2xl text-text-main mb-2">
                  Jaminan Keamanan &amp; Standar Layanan
                </h3>
                <p className="text-xs text-text-muted">
                  Logikraf menerapkan standar SLA tinggi untuk setiap proyek software yang dikerjakan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border-minimal space-y-2">
                  <div className="text-2xl mb-1">🛡️</div>
                  <h4 className="font-bold text-sm text-text-main">Garansi Pengerjaan</h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Setiap bug atau kendala teknis setelah rilis akan diperbaiki secara gratis selama masa garansi aktif.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border-minimal space-y-2">
                  <div className="text-2xl mb-1">⚡</div>
                  <h4 className="font-bold text-sm text-text-main">QRIS Terintegrasi Resmi</h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Pembayaran diproses melalui payment gateway terlisensi Bank Indonesia dengan notifikasi instan.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border-minimal space-y-2">
                  <div className="text-2xl mb-1">🤝</div>
                  <h4 className="font-bold text-sm text-text-main">Legalitas Terjamin</h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Setiap kerja sama dilindungi oleh kontrak resmi berbadan hukum PT. Logika Kreatif Indonesia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Checkout Drawer / Modal */}
        {checkoutModalOpen && selectedPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-border-minimal shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-text-main text-lg font-bold p-1"
              >
                ✕
              </button>

              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary block mb-1">
                  Konfirmasi Pembayaran
                </span>
                <h3 className="text-xl font-display font-extrabold text-text-main">
                  Pesan {selectedPkg.name}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Lengkapi identitas PIC pemesan untuk penerbitan faktur dan alur pembayaran QRIS.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-canvas-overlay border border-border-minimal flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-text-main">{selectedPkg.name}</p>
                  <p className="text-[11px] text-text-muted font-mono">
                    Metode: QRIS Nasional (iPaymu)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-extrabold text-base text-emerald-700">
                    {selectedPkg.formatted_price || fmt(selectedPkg.price)}
                  </p>
                  <span className="text-[10px] text-text-muted">Termasuk PPN &amp; Server</span>
                </div>
              </div>

              {err && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {err}
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-main mb-1 block">Nama Lengkap PIC *</label>
                  <input
                    type="text"
                    required
                    className="form-input text-xs sm:text-sm"
                    placeholder="Budi Santoso"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-main mb-1 block">Email Aktif *</label>
                    <input
                      type="email"
                      required
                      className="form-input text-xs sm:text-sm"
                      placeholder="budi@perusahaan.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-main mb-1 block">WhatsApp / No HP *</label>
                    <input
                      type="tel"
                      required
                      className="form-input text-xs sm:text-sm font-mono"
                      placeholder="08123456789"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border-minimal flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <span>🔒</span>
                    <span>Transaksi Terenkripsi SSL</span>
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-primary text-xs py-2.5 px-6 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    {busy ? 'Memproses QRIS...' : 'Lanjut Bayar QRIS →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
