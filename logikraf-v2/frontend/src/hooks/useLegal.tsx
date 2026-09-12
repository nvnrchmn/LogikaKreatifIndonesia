import { useEffect, useState } from 'react'

// Identitas & tanggal dokumen legal. Tanggal berasal dari settings
// (company_legal_updated) — TIDAK memakai new Date() supaya tidak berubah tiap hari.
const FB = {
  entity: 'PT Logika Kreatif Indonesia',
  form: 'Perseroan Perorangan',
  nib: '',
  npwp: '',
  address: 'Jl. Cijengkol Setu No.35a, Cijengkol, Kec. Setu, Kabupaten Bekasi, Jawa Barat 17320',
  email: 'support@logikraf.id',
  wa: '+62 898-3342-429',
  hours: 'Senin - Jumat, 09.00 - 18.00 WIB',
  updated: '12 September 2026',
}

export type LegalInfo = typeof FB

let cache: Promise<LegalInfo> | null = null

const pick = (d: Record<string, string>, k: string, fb: string) => {
  const v = (d[k] || '').trim()
  return v || fb
}

function load(): Promise<LegalInfo> {
  if (!cache) {
    cache = fetch('/api/settings/public')
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: Record<string, string>) => ({
        entity: pick(d, 'company_name', FB.entity),
        form: pick(d, 'company_legal_form', FB.form),
        nib: pick(d, 'company_legal_nib', ''),
        npwp: pick(d, 'company_legal_npwp', ''),
        address: pick(d, 'contact_address', FB.address),
        email: pick(d, 'contact_email', FB.email),
        wa: pick(d, 'contact_whatsapp', FB.wa),
        hours: pick(d, 'contact_hours', FB.hours),
        updated: pick(d, 'company_legal_updated', FB.updated),
      }))
      .catch(() => FB)
  }
  return cache
}

export function useLegalInfo(): LegalInfo {
  const [v, setV] = useState<LegalInfo>(FB)
  useEffect(() => {
    load().then(setV)
  }, [])
  return v
}

// LegalUpdated — tanggal pembaruan dokumen (nilai tetap, bisa diubah dari admin).
export function LegalUpdated({ className = 'text-text-muted text-sm mb-10' }: { className?: string }) {
  const info = useLegalInfo()
  return <p className={className}>Pembaruan Terakhir: {info.updated}</p>
}

// LegalIdentity — blok identitas badan usaha untuk halaman legal.
export function LegalIdentity() {
  const info = useLegalInfo()
  const rows: [string, string][] = [
    ['Badan usaha', info.entity + (info.form ? ` (${info.form})` : '')],
    ['Alamat', info.address],
    ['Email', info.email],
    ['WhatsApp', info.wa],
    ['Jam layanan', info.hours],
  ]
  if (info.nib) rows.push(['NIB', info.nib])
  if (info.npwp) rows.push(['NPWP', info.npwp])
  return (
    <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold mb-4">Identitas Badan Usaha</h2>
      <dl className="space-y-2 text-sm">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:gap-3">
            <dt className="text-text-muted sm:w-32 shrink-0">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
