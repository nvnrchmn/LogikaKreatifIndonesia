import { useState } from 'react'
import type { ReactNode } from 'react'

type TabKey = 'funnel' | 'payment' | 'status' | 'cron'

const tabs: { key: TabKey; label: string; description: string }[] = [
  { key: 'funnel', label: 'Funnel Penjualan', description: 'Dari prospek hingga project selesai' },
  { key: 'payment', label: 'Alur Pembayaran', description: 'Dari bayar QRIS hingga notifikasi' },
  { key: 'status', label: 'Status State Machine', description: 'Transisi status yang diizinkan sistem' },
  { key: 'cron', label: 'Otomatis (Cron)', description: 'Job yang dijalankan otomatis sistem' },
]

const funnelDiagram = (
  <svg viewBox="0 0 1000 420" className="w-full h-auto max-w-5xl">
    {/* Background */}
    <rect x="0" y="0" width="1000" height="420" fill="#fafafb" rx="16" />

    {/* Title */}
    <text x="500" y="40" textAnchor="middle" className="fill-text-main" fontSize="20" fontWeight="bold">
      Funnel Penjualan Software House
    </text>
    <text x="500" y="62" textAnchor="middle" className="fill-text-muted" fontSize="12">
      Alur kerja utama: dari calon klien hingga project selesai
    </text>

    {/* Stage boxes */}
    {[
      { x: 40, y: 100, w: 180, h: 140, color: '#8b5cf6', label: '1. Leads', sub: 'Calon klien masuk', fields: ['• Name, email, company', '• Service category', '• Lead score'] },
      { x: 260, y: 100, w: 180, h: 140, color: '#3b82f6', label: '2. Clients', sub: 'Prospek dikonversi', fields: ['• PIC name, email', '• Company, phone', '• Address'] },
      { x: 480, y: 100, w: 180, h: 140, color: '#10b981', label: '3. Orders', sub: 'Klien pesan jasa', fields: ['• Order number', '• Package & amount', '• Status tracking'] },
      { x: 700, y: 100, w: 260, h: 140, color: '#f59e0b', label: '4. Projects', sub: 'Pengerjaan dimulai', fields: ['• Timeline & deadline', '• Repository URL', '• Status workflow'] },
    ].map((s) => (
      <g key={s.label}>
        <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="12" fill={s.color} opacity="0.15" />
        <rect x={s.x} y={s.y} width="6" height={s.h} rx="3" fill={s.color} />
        <text x={s.x + 16} y={s.y + 28} className="fill-text-main" fontSize="15" fontWeight="bold">{s.label}</text>
        <text x={s.x + 16} y={s.y + 48} className="fill-text-muted" fontSize="11">{s.sub}</text>
        <text x={s.x + 16} y={s.y + 75} className="fill-text-muted" fontSize="10">Isi data:</text>
        {s.fields.map((f, i) => (
          <text key={f} x={s.x + 16} y={s.y + 92 + i * 16} className="fill-text-muted" fontSize="10">{f}</text>
        ))}
      </g>
    ))}

    {/* Arrows */}
    {[
      { x1: 225, x2: 255 },
      { x1: 445, x2: 475 },
      { x1: 665, x2: 695 },
    ].map((a) => (
      <g key={a.x1}>
        <line x1={a.x1} y1={170} x2={a.x2} y2={170} stroke="#d1d5db" strokeWidth="2" />
        <polygon points={`${a.x2 - 8},166 ${a.x2},170 ${a.x2 - 8},174`} fill="#d1d5db" />
      </g>
    ))}

    {/* Labels on arrows */}
    {[
      { x: 352, text: 'Convert (1x)', color: '#8b5cf6' },
      { x: 572, text: 'Buat Order', color: '#3b82f6' },
      { x: 832, text: 'Auto-create', color: '#10b981' },
    ].map((l) => (
      <text key={l.x} x={l.x} y={195} textAnchor="middle" fontSize="11" fill={l.color} fontWeight="bold">{l.text}</text>
    ))}

    {/* Bottom row: Actions */}
    <text x="500" y="280" textAnchor="middle" className="fill-text-main" fontSize="14" fontWeight="bold">
      Aksi yang Bisa Dilakukan Admin
    </text>

    {[
      { x: 60, label: 'Leads', actions: ['Edit & follow-up', 'Update lead score', 'Status pipeline', 'Convert ke Client'] },
      { x: 260, label: 'Clients', actions: ['Edit profil klien', 'Lihat daftar orders', 'Hapus klien'] },
      { x: 460, label: 'Orders', actions: ['Ubah status (state machine)', 'Bayar DP / pelunasan', 'Lihat project terkait'] },
      { x: 700, label: 'Projects', actions: ['Ubah status (state machine)', 'Set deadline & URL', 'Buka workspace'] },
    ].map((s, i) => (
      <g key={i}>
        <rect x={s.x} y={295} width={200} height={100} rx="8" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        <text x={s.x + 12} y={311} className="fill-text-main" fontSize="11" fontWeight="bold">{s.label}</text>
        {s.actions.map((a, j) => (
          <g key={j}>
            <circle cx={s.x + 20} cy={325 + j * 18} r="3" fill="#10b981" />
            <text x={s.x + 30} y={329 + j * 18} className="fill-text-muted" fontSize="10">{a}</text>
          </g>
        ))}
      </g>
    ))}
  </svg>
)

const paymentDiagram = (
  <svg viewBox="0 0 1000 500" className="w-full h-auto max-w-5xl">
    <rect x="0" y="0" width="1000" height="500" fill="#fafafb" rx="16" />

    <text x="500" y="40" textAnchor="middle" className="fill-text-main" fontSize="20" fontWeight="bold">
      Alur Pembayaran QRIS
    </text>
    <text x="500" y="62" textAnchor="middle" className="fill-text-muted" fontSize="12">
      Dari klien bayar hingga notifikasi & project terbuat
    </text>

    {/* Row 1: Payment flow */}
    <text x="40" y="100" className="fill-text-main" fontSize="13" fontWeight="bold">1. Client Bayar QRIS</text>

    {/* Step 1: QRIS Payment */}
    <g>
      <rect x="40" y="115" width="180" height="90" rx="10" fill="#ddd6fe" />
      <rect x="40" y="115" width="6" height="90" rx="3" fill="#8b5cf6" />
      <text x="56" y="140" className="fill-text-main" fontSize="13" fontWeight="bold">Klien scan QRIS</text>
      <text x="56" y="158" className="fill-text-muted" fontSize="11">iPaymu sandbox</text>
      <text x="56" y="175" className="fill-text-muted" fontSize="11">Amount + description</text>
      <text x="56" y="192" className="fill-text-muted" fontSize="11">Client name & email</text>
    </g>

    {/* Arrow */}
    <line x1="225" y1="160" x2="255" y2="160" stroke="#d1d5db" strokeWidth="2" />
    <polygon points="247,156 255,160 247,164" fill="#d1d5db" />

    {/* Step 2: Webhook */}
    <g>
      <rect x="260" y="115" width="170" height="90" rx="10" fill="#fef3c7" />
      <rect x="260" y="115" width="6" height="90" rx="3" fill="#f59e0b" />
      <text x="276" y="140" className="fill-text-main" fontSize="13" fontWeight="bold">iPaymu webhook</text>
      <text x="276" y="158" className="fill-text-muted" fontSize="11">status = berhasil</text>
      <text x="276" y="175" className="fill-text-muted" fontSize="11">reference_id = order</text>
      <text x="276" y="192" className="fill-text-muted" fontSize="11">trx_id unik</text>
    </g>

    {/* Arrow */}
    <line x1="435" y1="160" x2="465" y2="160" stroke="#d1d5db" strokeWidth="2" />
    <polygon points="457,156 465,160 457,164" fill="#d1d5db" />

    {/* Step 3: Backend processes */}
    <g>
      <rect x="470" y="95" width="220" height="130" rx="10" fill="#dbeafe" />
      <rect x="470" y="95" width="6" height="130" rx="3" fill="#3b82f6" />
      <text x="486" y="120" className="fill-text-main" fontSize="13" fontWeight="bold">Backend Memproses</text>
      <text x="486" y="140" className="fill-text-muted" fontSize="10">✅ Cek idempotency (processed_webhooks)</text>
      <text x="486" y="158" className="fill-text-muted" fontSize="10">✅ Update PaymentTransaction → settled</text>
      <text x="486" y="176" className="fill-text-muted" fontSize="10">✅ Create Transaction (ledger)</text>
      <text x="486" y="194" className="fill-text-muted" fontSize="10">✅ Create Invoice (receipt) → paid</text>
      <text x="486" y="212" className="fill-text-muted" fontSize="10">✅ Create Notification (admin)</text>
    </g>

    {/* Row 2: Results */}
    <text x="40" y="270" className="fill-text-main" fontSize="13" fontWeight="bold">2. Hasil yang Tercatat Otomatis</text>

    {[
      { x: 40, y: 285, label: 'Transaction (Ledger)', color: '#3b82f6', fields: ['• Milestone name', '• Amount & method', '• Status: settled', '• Reference ID'] },
      { x: 240, y: 285, label: 'Invoice (Receipt)', color: '#10b981', fields: ['• Invoice number', '• Total & paid_amount', '• Status: paid', '• Issue & due date'] },
      { x: 440, y: 285, label: 'Notification', color: '#f59e0b', fields: ['• Type: payment_settled', '• Title & message', '• Ref to payment_trx', '• Read/unread'] },
      { x: 640, y: 285, label: 'Order', color: '#8b5cf6', fields: ['• Status: paid', '• Milestone update', '• Client linked', '• Auto-create Client?'] },
    ].map((s) => (
      <g key={s.label}>
        <rect x={s.x} y={s.y} width={170} height={100} rx="8" fill={s.color} opacity="0.1" stroke={s.color} strokeWidth="1" />
        <text x={s.x + 12} y={s.y + 18} className="fill-text-main" fontSize="11" fontWeight="bold">{s.label}</text>
        {s.fields.map((f, i) => (
          <text key={f} x={s.x + 12} y={s.y + 34 + i * 17} className="fill-text-muted" fontSize="10">{f}</text>
        ))}
      </g>
    ))}

    {/* Row 3: Admin action */}
    <text x="40" y="420" className="fill-text-main" fontSize="13" fontWeight="bold">3. Tindakan Admin</text>

    <g>
      <rect x="40" y="435" width="320" height="50" rx="8" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
      <text x="52" y="453" className="fill-text-main" fontSize="11" fontWeight="bold">Lihat Notifikasi → Klik → Buat Project</text>
      <text x="52" y="470" className="fill-text-muted" fontSize="10">Admin klik notifikasi "Pembayaran Diterima", isi nama project + deadline, project terbuat dengan status planning</text>
    </g>

    <g>
      <rect x="380" y="435" width="320" height="50" rx="8" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
      <text x="392" y="453" className="fill-text-main" fontSize="11" fontWeight="bold">Opsional: Buat Client dari Payment</text>
      <text x="392" y="470" className="fill-text-muted" fontSize="10">Klien baru? Klik "Create Client" di halaman payment transactions</text>
    </g>
  </svg>
)

const statusDiagram = (
  <svg viewBox="0 0 1000 560" className="w-full h-auto max-w-5xl">
    <rect x="0" y="0" width="1000" height="560" fill="#fafafb" rx="16" />

    <text x="500" y="40" textAnchor="middle" className="fill-text-main" fontSize="20" fontWeight="bold">
      Status State Machine
    </text>
    <text x="500" y="62" textAnchor="middle" className="fill-text-muted" fontSize="12">
      Status tidak bisa diubah sembarangan — sistem hanya mengizinkan transisi tertentu
    </text>

    {/* Orders state machine */}
    <g>
      <text x="40" y="100" className="fill-text-main" fontSize="14" fontWeight="bold">Orders</text>
      {[
        { label: 'pending', x: 40, y: 120, color: '#f59e0b' },
        { label: 'paid', x: 180, y: 120, color: '#10b981' },
        { label: 'active', x: 320, y: 120, color: '#3b82f6' },
        { label: 'completed', x: 480, y: 120, color: '#22c55e' },
        { label: 'cancelled', x: 480, y: 190, color: '#ef4444' },
        { label: 'on_hold', x: 320, y: 190, color: '#f97316' },
        { label: 'refunded', x: 180, y: 190, color: '#a855f7' },
      ].map((s) => (
        <g key={s.label}>
          <rect x={s.x} y={s.y} width={120} height="40" rx="8" fill={s.color} opacity="0.2" stroke={s.color} strokeWidth="1" />
          <text x={s.x + 60} y={s.y + 25} textAnchor="middle" className="fill-text-main" fontSize="11" fontWeight="bold">{s.label}</text>
        </g>
      ))}
      {/* Arrows */}
      <line x1="130" y1="140" x2="175" y2="140" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="270" y1="140" x2="315" y2="140" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="430" y1="140" x2="475" y2="140" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="540" y1="160" x2="540" y2="185" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="460" y1="210" x2="415" y2="210" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="320" y1="210" x2="315" y2="210" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="290" y1="190" x2="290" y2="165" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
    </g>

    {/* Projects state machine */}
    <g>
      <text x="40" y="270" className="fill-text-main" fontSize="14" fontWeight="bold">Projects</text>
      {[
        { label: 'planning', x: 40, y: 290, color: '#6b7280' },
        { label: 'in_progress', x: 180, y: 290, color: '#3b82f6' },
        { label: 'review', x: 340, y: 290, color: '#a855f7' },
        { label: 'completed', x: 500, y: 290, color: '#22c55e' },
        { label: 'on_hold', x: 180, y: 360, color: '#f97316' },
        { label: 'cancelled', x: 340, y: 360, color: '#ef4444' },
      ].map((s) => (
        <g key={s.label}>
          <rect x={s.x} y={s.y} width={130} height="40" rx="8" fill={s.color} opacity="0.2" stroke={s.color} strokeWidth="1" />
          <text x={s.x + 65} y={s.y + 25} textAnchor="middle" className="fill-text-main" fontSize="11" fontWeight="bold">{s.label.replace('_', ' ')}</text>
        </g>
      ))}
      <line x1="135" y1="310" x2="175" y2="310" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow2)" />
      <line x1="285" y1="310" x2="335" y2="310" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow2)" />
      <line x1="445" y1="310" x2="495" y2="310" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow2)" />
      <line x1="565" y1="330" x2="565" y2="375" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow2)" />
      <line x1="470" y1="380" x2="425" y2="380" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow2)" />
      <line x1="310" y1="380" x2="285" y2="380" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow2)" />
      <line x1="245" y1="360" x2="245" y2="335" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow2)" />
      <line x1="245" y1="290" x2="245" y2="290" stroke="#9ca3af" strokeWidth="1.5" />
      <defs>
        <marker id="arrow2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
    </g>

    {/* Tickets state machine */}
    <g>
      <text x="40" y="440" className="fill-text-main" fontSize="14" fontWeight="bold">Tickets</text>
      {[
        { label: 'open', x: 40, y: 460, color: '#3b82f6' },
        { label: 'pending', x: 180, y: 460, color: '#f59e0b' },
        { label: 'closed', x: 340, y: 460, color: '#22c55e' },
      ].map((s) => (
        <g key={s.label}>
          <rect x={s.x} y={s.y} width={120} height="40" rx="8" fill={s.color} opacity="0.2" stroke={s.color} strokeWidth="1" />
          <text x={s.x + 60} y={s.y + 25} textAnchor="middle" className="fill-text-main" fontSize="11" fontWeight="bold">{s.label}</text>
        </g>
      ))}
      <line x1="135" y1="480" x2="175" y2="480" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow3)" />
      <line x1="275" y1="480" x2="335" y2="480" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow3)" />
      <line x1="400" y1="460" x2="400" y2="440" stroke="#9ca3af" strokeWidth="1" />
      <line x1="400" y1="440" x2="100" y2="440" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4" />
      <line x1="100" y1="440" x2="100" y2="455" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow3)" />
      <text x="220" y="435" textAnchor="middle" className="fill-text-muted" fontSize="10">reopen</text>
      <defs>
        <marker id="arrow3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
    </g>

    {/* Cascade note */}
    <g>
      <rect x="600" y="440" width="360" height="90" rx="8" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
      <text x="615" y="460" className="fill-text-main" fontSize="11" fontWeight="bold">💡 Cascade Order → Project</text>
      <text x="615" y="478" className="fill-text-muted" fontSize="10">Order → active: Project planning → in_progress</text>
      <text x="615" y="494" className="fill-text-muted" fontSize="10">Order → cancelled: Project ikut cancelled</text>
      <text x="615" y="510" className="fill-text-muted" fontSize="10">Order status PAID → langsung trigger cascade</text>
      <text x="615" y="526" className="fill-text-muted" fontSize="10">Review → Completed: Project tetap aman</text>
    </g>
  </svg>
)

const cronDiagram = (
  <svg viewBox="0 0 1000 400" className="w-full h-auto max-w-5xl">
    <rect x="0" y="0" width="1000" height="400" fill="#fafafb" rx="16" />

    <text x="500" y="40" textAnchor="middle" className="fill-text-main" fontSize="20" fontWeight="bold">
      Job Otomatis (Cron)
    </text>
    <text x="500" y="62" textAnchor="middle" className="fill-text-muted" fontSize="12">
      Dijalankan background oleh sistem, bisa diaktifkan/nonaktifkan dari Admin → Otomatis
    </text>

    {/* Scheduler icon */}
    <g>
      <circle cx="500" cy="150" r="60" fill="#dbeafe" />
      <circle cx="500" cy="150" r="45" fill="#3b82f6" opacity="0.2" />
      <text x="500" y="145" textAnchor="middle" className="fill-text-main" fontSize="24">⏰</text>
      <text x="500" y="168" textAnchor="middle" className="fill-text-main" fontSize="11" fontWeight="bold">Scheduler</text>
      <text x="500" y="182" textAnchor="middle" className="fill-text-muted" fontSize="9">Goroutine + robfig/cron</text>
    </g>

    {/* Job 1: Invoice Reminders */}
    <g>
      <rect x="100" y="260" width="280" height="110" rx="12" fill="#fef3c7" />
      <rect x="100" y="260" width="6" height="110" rx="3" fill="#f59e0b" />
      <text x="116" y="285" className="fill-text-main" fontSize="13" fontWeight="bold">📧 Pengingat Tagihan</text>
      <text x="116" y="303" className="fill-text-muted" fontSize="11">Jadwal: Setiap jam 09:00</text>
      <text x="116" y="320" className="fill-text-muted" fontSize="11">Aksi:</text>
      <text x="126" y="336" className="fill-text-muted" fontSize="10">• Cek invoice yang jatuh tempo hari ini</text>
      <text x="126" y="352" className="fill-text-muted" fontSize="10">• Kirim email pengingat ke klien</text>
      <text x="126" y="368" className="fill-text-muted" fontSize="10">• Log ke invoice_reminders (anti-spam 1x/hari)</text>
    </g>

    {/* Job 2: Status Refresh */}
    <g>
      <rect x="420" y="260" width="280" height="110" rx="12" fill="#dbeafe" />
      <rect x="420" y="260" width="6" height="110" rx="3" fill="#3b82f6" />
      <text x="436" y="285" className="fill-text-main" fontSize="13" fontWeight="bold">🔄 Perbarui Status Invoice</text>
      <text x="436" y="303" className="fill-text-muted" fontSize="11">Jadwal: Setiap jam 08:00</text>
      <text x="436" y="320" className="fill-text-muted" fontSize="11">Aksi:</text>
      <text x="446" y="336" className="fill-text-muted" fontSize="10">• Cek semua invoice status 'sent'</text>
      <text x="446" y="352" className="fill-text-muted" fontSize="10">• Lewati due date → status: overdue</text>
      <text x="446" y="368" className="fill-text-muted" fontSize="10">• Draft & paid diskip</text>
    </g>

    {/* Arrows from scheduler */}
    <line x1="460" y1="190" x2="270" y2="255" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4" />
    <line x1="540" y1="190" x2="560" y2="255" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4" />

    {/* Cadence detail */}
    <g>
      <rect x="740" y="260" width="220" height="110" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
      <text x="756" y="283" className="fill-text-main" fontSize="11" fontWeight="bold">Cadence Pengingat:</text>
      <text x="756" y="300" className="fill-text-muted" fontSize="10">• 3 hari sebelum jatuh tempo</text>
      <text x="756" y="316" className="fill-text-muted" fontSize="10">• Hari H (jatuh tempo)</text>
      <text x="756" y="332" className="fill-text-muted" fontSize="10">• Telat 1, 3, 7, 14 hari</text>
      <text x="756" y="348" className="fill-text-muted" fontSize="10">• Setiap 14 hari setelahnya</text>
      <text x="756" y="364" className="fill-text-muted" fontSize="10">• Anti-spam: max 1x/hari</text>
    </g>
  </svg>
)

const diagrams: Record<TabKey, ReactNode> = {
  funnel: funnelDiagram,
  payment: paymentDiagram,
  status: statusDiagram,
  cron: cronDiagram,
}

export default function WorkflowDocsPage() {
  const [tab, setTab] = useState<TabKey>('funnel')
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-text-main text-lg">Dokumentasi Workflow</h2>
        <p className="text-text-muted text-xs mt-0.5">
          Diagram alur kerja sistem logikraf.id — tahapan, status, dan job otomatis
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
              tab === t.key
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-white text-text-muted border-border-minimal hover:border-brand-primary/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active tab description */}
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm px-5 py-3 flex items-center gap-3">
        <span className="px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-wider">
          {tabs.find((t) => t.key === tab)?.label}
        </span>
        <span className="text-text-muted text-xs">{tabs.find((t) => t.key === tab)?.description}</span>
      </div>

      {/* Diagram */}
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-4 md:p-6 overflow-x-auto">
        {diagrams[tab]}
      </div>

      {/* Quick reference card */}
      <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-5">
        <p className="font-bold text-text-main text-sm mb-3">📌 Catatan Penting</p>
        <ul className="space-y-1.5 text-xs text-text-muted">
          <li>• <strong>Status tidak bisa diubah sembarangan</strong> — sistem memaksa transisi yang diizinkan (state machine).</li>
          <li>• <strong>Webhook idempotency</strong> — pembayaran yang sama tidak akan tercatat dua kali.</li>
          <li>• <strong>Ledger transaksi</strong> — setiap pembayaran DP/pelunasan tercatat di Transactions.</li>
          <li>• <strong>Cascade Order → Project</strong> — order aktif otomatis menjalankan project.</li>
          <li>• <strong>Reminder anti-spam</strong> — klien maksimal dikirim 1 email sehari per invoice.</li>
        </ul>
      </div>
    </div>
  )
}
