// Central registry for admin CRUD resources.
// One source of truth replaces the 11 per-resource page files.

export interface ColumnDef {
  id: string
  label: string
  render?: (row: any) => any
}

export interface FieldDef {
  name: string
  label: string
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'image'
  uploadFolder?: string // for type:'image', e.g. "portfolio" | "post"
  required?: boolean
  multiline?: boolean
  rows?: number
  options?: { value: string; label: string }[]
  min?: number
  pattern?: string
}

// A custom per-row action rendered next to Edit/Hapus.
// Used for workflow transitions that are more than a plain field edit,
// e.g. moving a project through its status state machine or converting a lead.
export interface RowActionDef {
  id: string
  label: string | ((row: any) => string)
  // Hide the action for rows where it does not apply (e.g. already converted).
  visible?: (row: any) => boolean
  // POST/PUT target. `:id` is replaced with the row id.
  endpoint: string
  method?: 'POST' | 'PUT'
  // Visual weight. 'primary' = brand colour, 'neutral' = subdued.
  tone?: 'primary' | 'neutral'
  // Short confirmation copy shown in the modal before firing.
  confirmTitle: string
  confirmBody?: string | ((row: any) => string)
  // Optional fields collected in the modal and sent as the JSON body.
  fields?: FieldDef[]
  // Fetch selectable values for a field at open time (e.g. legal next statuses).
  optionsEndpoint?: string
  optionsField?: string
  successMessage?: string
}

export interface ResourceConfig {
  resource: string // url slug, e.g. "services"
  title: string // human title, e.g. "Layanan"
  endpoint: string // api base, e.g. "/api/services"
  columns: ColumnDef[]
  formFields: FieldDef[]
  emptyRow: string
  rowActions?: RowActionDef[]
}

const renderActiveBadge = (val: any) => {
  const active = val === true || val === 1 || val === '1' || val === 'Ya'
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>Aktif</span>
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
      Nonaktif
    </span>
  )
}

const renderPublishedBadge = (val: any) => {
  const pub = val === true || val === 1 || val === '1' || val === 'Ya'
  return pub ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <span>Published</span>
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
      Draft
    </span>
  )
}

export const crudConfigs: Record<string, ResourceConfig> = {
  portfolios: {
    resource: 'portfolios',
    title: 'Portofolio',
    endpoint: '/api/portfolios',
    emptyRow: 'Belum ada studi kasus portofolio.',
    columns: [
      {
        id: 'title',
        label: 'Judul Proyek',
        render: (r: any) => (
          <div className="flex items-center gap-3">
            {r.thumbnail ? (
              <img
                src={r.thumbnail}
                alt=""
                className="w-10 h-10 rounded-xl object-cover border border-border-minimal shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100">
                PROJ
              </div>
            )}
            <div>
              <span className="font-bold text-text-main block">{r.title}</span>
              <span className="text-[11px] text-text-muted font-mono">{r.slug}</span>
            </div>
          </div>
        ),
      },
      {
        id: 'client_name',
        label: 'Klien',
        render: (r: any) =>
          r.client_name ? (
            <span className="px-2.5 py-1 rounded-lg bg-canvas-overlay text-text-main text-xs font-semibold border border-border-minimal">
              {r.client_name}
            </span>
          ) : (
            <span className="text-text-muted text-xs">—</span>
          ),
      },
      {
        id: 'is_published',
        label: 'Visibilitas',
        render: (r: any) => renderPublishedBadge(r.is_published),
      },
    ],
    formFields: [
      { name: 'title', label: 'Judul Proyek', required: true },
      { name: 'slug', label: 'Slug URL', required: true },
      { name: 'client_name', label: 'Nama Klien / Perusahaan' },
      { name: 'excerpt', label: 'Ringkasan Singkat' },
      { name: 'description', label: 'Deskripsi Kasus & Solusi Lengkap', type: 'textarea', rows: 4 },
      { name: 'thumbnail', label: 'Gambar Thumbnail', type: 'image', uploadFolder: 'portfolio' },
      {
        name: 'is_published',
        label: 'Status Rilis',
        type: 'select',
        options: [
          { value: '1', label: 'Published' },
          { value: '0', label: 'Draft' },
        ],
      },
    ],
  },
  packages: {
    resource: 'packages',
    title: 'Paket Layanan',
    endpoint: '/api/packages',
    emptyRow: 'Belum ada paket website.',
    columns: [
      {
        id: 'name',
        label: 'Nama Paket',
        render: (r: any) => (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-main">{r.name}</span>
              {r.is_featured && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                  ★ Rekomendasi
                </span>
              )}
            </div>
            {r.tagline && <span className="text-[11px] text-text-muted">{r.tagline}</span>}
          </div>
        ),
      },
      {
        id: 'price',
        label: 'Harga Resmi',
        render: (r: any) => (
          <div>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              Rp {Number(r.price).toLocaleString('id-ID')}
            </span>
            {r.strike_price && (
              <span className="text-[11px] text-text-muted line-through block font-mono">
                Rp {Number(r.strike_price).toLocaleString('id-ID')}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'is_active',
        label: 'Status',
        render: (r: any) => renderActiveBadge(r.is_active),
      },
    ],
    formFields: [
      { name: 'name', label: 'Nama Paket', required: true },
      { name: 'slug', label: 'Slug URL', required: true },
      { name: 'tagline', label: 'Tagline Promosi' },
      { name: 'price', label: 'Harga Final (IDR)', type: 'number', required: true, min: 0 },
      { name: 'strike_price', label: 'Harga Coret / Asli (IDR)', type: 'number', min: 0 },
      { name: 'features', label: 'Daftar Fitur (Pisahkan baris baru)', type: 'textarea', rows: 4 },
      {
        name: 'is_featured',
        label: 'Tandai Sebagai Rekomendasi',
        type: 'select',
        options: [
          { value: '1', label: 'Ya (Tampilkan Badge Populer)' },
          { value: '0', label: 'Tidak' },
        ],
      },
      {
        name: 'is_active',
        label: 'Status Penjualan',
        type: 'select',
        options: [
          { value: '1', label: 'Aktif (Dapat Dipesan)' },
          { value: '0', label: 'Nonaktif' },
        ],
      },
    ],
  },
  templates: {
    resource: 'templates',
    title: 'Template Proyek',
    endpoint: '/api/templates',
    emptyRow: 'Belum ada template proyek.',
    columns: [
      {
        id: 'name',
        label: 'Nama Template',
        render: (r: any) => (
          <div>
            <span className="font-bold text-text-main">{r.name}</span>
            {r.repo_url && (
              <a href={r.repo_url} target="_blank" rel="noreferrer" className="block text-[11px] text-blue-600 hover:underline">
                {r.repo_url}
              </a>
            )}
          </div>
        ),
      },
      {
        id: 'package_id',
        label: 'ID Paket',
        render: (r: any) => <span className="font-mono text-xs">{r.package_id || '—'}</span>,
      },
      {
        id: 'artifact_key',
        label: 'Kunci Artifact S3',
        render: (r: any) => <span className="font-mono text-[11px] text-text-muted">{r.artifact_key || '—'}</span>,
      },
      {
        id: 'is_active',
        label: 'Status',
        render: (r: any) => renderActiveBadge(r.is_active),
      },
    ],
    formFields: [
      { name: 'name', label: 'Nama Template', required: true },
      { name: 'package_id', label: 'ID Paket Terkait', type: 'number', min: 0 },
      { name: 'repo_url', label: 'URL Repositori GitHub' },
      { name: 'artifact_key', label: 'Kunci Artifact S3 (.tar.gz)', required: true },
      { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
      {
        name: 'is_active',
        label: 'Status',
        type: 'select',
        options: [
          { value: '1', label: 'Aktif' },
          { value: '0', label: 'Nonaktif' },
        ],
      },
    ],
  },
  blog: {
    resource: 'blog',
    title: 'Blog & Artikel',
    endpoint: '/api/posts',
    emptyRow: 'Belum ada artikel yang dibuat.',
    columns: [
      {
        id: 'title',
        label: 'Judul Artikel',
        render: (r: any) => (
          <div>
            <span className="font-bold text-text-main block">{r.title}</span>
            <span className="text-[11px] text-text-muted font-mono">{r.slug}</span>
          </div>
        ),
      },
      {
        id: 'excerpt',
        label: 'Ringkasan Sinopsis',
        render: (r: any) => {
          const raw = (r.excerpt || r.body || '').replace(/<[^>]*>?/gm, '').trim()
          return (
            <span className="text-xs text-text-muted line-clamp-2 max-w-sm">
              {raw || '—'}
            </span>
          )
        },
      },
      {
        id: 'is_published',
        label: 'Status Publikasi',
        render: (r: any) => renderPublishedBadge(r.is_published),
      },
    ],
    formFields: [
      { name: 'title', label: 'Judul Artikel', required: true },
      { name: 'slug', label: 'Slug URL', required: true },
      { name: 'excerpt', label: 'Ringkasan / Sinopsis' },
      { name: 'body', label: 'Isi Konten Artikel', type: 'textarea', rows: 6 },
      { name: 'featured_image', label: 'Gambar Utama', type: 'image', uploadFolder: 'post' },
      {
        name: 'is_published',
        label: 'Status Rilis',
        type: 'select',
        options: [
          { value: '1', label: 'Published' },
          { value: '0', label: 'Draft' },
        ],
      },
    ],
  },
  leads: {
    resource: 'leads',
    title: 'Prospek Leads',
    endpoint: '/api/leads',
    emptyRow: 'Belum ada data prospek lead.',
    columns: [
      {
        id: 'name',
        label: 'Nama Prospek',
        render: (r: any) => (
          <div>
            <span className="font-bold text-text-main block">{r.name}</span>
            <span className="text-[11px] text-text-muted font-mono">{r.email}</span>
          </div>
        ),
      },
      {
        id: 'company',
        label: 'Perusahaan / Kontak',
        render: (r: any) => (
          <div>
            <span className="text-xs font-semibold text-text-main block">{r.company || '—'}</span>
            <span className="text-[11px] text-text-muted font-mono">{r.phone || '—'}</span>
          </div>
        ),
      },
      {
        id: 'status',
        label: 'Status Prospek',
        render: (r: any) => {
          const st = String(r.status || 'new').toLowerCase()
          const colorMap: Record<string, string> = {
            new: 'bg-blue-50 text-blue-700 border-blue-200',
            contacted: 'bg-amber-50 text-amber-700 border-amber-200',
            qualified: 'bg-purple-50 text-purple-700 border-purple-200',
            closing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            converted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            lost: 'bg-rose-50 text-rose-700 border-rose-200',
          }
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                colorMap[st] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="capitalize">{r.status || 'New'}</span>
            </span>
          )
        },
      },
    ],
    formFields: [
      { name: 'name', label: 'Nama Lengkap', required: true },
      { name: 'email', label: 'Email Aktif', required: true },
      { name: 'phone', label: 'Nomor WhatsApp' },
      { name: 'company', label: 'Nama Perusahaan / Instansi' },
      { name: 'service_category', label: 'Kategori Layanan Minat' },
      {
        name: 'status',
        label: 'Status Pipeline Prospek',
        type: 'select',
        options: [
          { value: 'new', label: 'New (Baru Masuk)' },
          { value: 'contacted', label: 'Contacted (Sedang Dihubungi)' },
          { value: 'qualified', label: 'Qualified (Prospek Matang)' },
          { value: 'closing', label: 'Closing (Deal Proyek)' },
          { value: 'lost', label: 'Lost (Batal / Tidak Lanjut)' },
        ],
      },
      { name: 'lead_score', label: 'Skor Prospek (1 - 100)', type: 'number', min: 0 },
      { name: 'notes', label: 'Catatan Kebutuhan Klien', type: 'textarea', rows: 3 },
    ],
    rowActions: [
      {
        id: 'convert',
        label: 'Jadikan Klien',
        // A lead can only be converted once; the backend also returns 409 on retry.
        visible: (r: any) => String(r.status || '').toLowerCase() !== 'converted',
        endpoint: '/api/leads/:id/convert',
        method: 'POST',
        tone: 'primary',
        confirmTitle: 'Konversi Prospek ke Klien',
        confirmBody: (r: any) =>
          `Prospek "${r.name}" akan dibuatkan data Klien, dan status lead menjadi "converted". Jika email sudah terdaftar sebagai klien, data yang ada akan dipakai (tidak duplikat).`,
        successMessage: 'Prospek berhasil dikonversi menjadi klien.',
      },
    ],
  },
  orders: {
    resource: 'orders',
    title: 'Pesanan Orders',
    endpoint: '/api/orders',
    emptyRow: 'Belum ada pesanan masuk.',
    columns: [
      {
        id: 'order_number',
        label: 'No. Order',
        render: (r: any) => (
          <span className="font-mono font-bold text-xs text-text-main px-2 py-1 rounded-md bg-canvas-overlay border border-border-minimal">
            {r.order_number || `#${r.id}`}
          </span>
        ),
      },
      {
        id: 'project_name',
        label: 'Nama Proyek',
        render: (r: any) => <span className="font-bold text-text-main">{r.project_name}</span>,
      },
      {
        id: 'total_amount',
        label: 'Nominal Tagihan',
        render: (r: any) => (
          <span className="font-mono font-bold text-emerald-700 text-sm">
            Rp {Number(r.total_amount || 0).toLocaleString('id-ID')}
          </span>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        render: (r: any) => {
          const st = String(r.status || 'pending').toLowerCase()
          const colorMap: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            paid: 'bg-teal-50 text-teal-700 border-teal-200',
            active: 'bg-blue-50 text-blue-700 border-blue-200',
            on_hold: 'bg-orange-50 text-orange-700 border-orange-200',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
            refunded: 'bg-purple-50 text-purple-700 border-purple-200',
          }
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                colorMap[st] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {st.replace('_', ' ')}
            </span>
          )
        },
      },
    ],
    formFields: [
      { name: 'order_number', label: 'Nomor Order / Referensi', required: true },
      { name: 'client_id', label: 'ID Client', type: 'number', required: true, min: 1 },
      { name: 'project_name', label: 'Nama Proyek / Paket', required: true },
      { name: 'total_amount', label: 'Total Nominal (IDR)', type: 'number', required: true, min: 0 },
      {
        name: 'status',
        label: 'Status Pesanan',
        type: 'select',
        options: [
          { value: 'pending', label: 'Pending (Menunggu Bayar)' },
          { value: 'paid', label: 'Paid (Sudah Dibayar)' },
          { value: 'active', label: 'Active (Dalam Pengerjaan)' },
          { value: 'on_hold', label: 'On Hold (Ditahan)' },
          { value: 'completed', label: 'Completed (Selesai)' },
          { value: 'cancelled', label: 'Cancelled (Dibatalkan)' },
          { value: 'refunded', label: 'Refunded (Dana Dikembalikan)' },
        ],
      },
      { name: 'milestone_status', label: 'Status Milestone / Termin Pengerjaan' },
    ],
    rowActions: [
      {
        id: 'status',
        label: 'Ubah Status',
        visible: (r: any) =>
          !['completed', 'cancelled', 'refunded'].includes(String(r.status || '').toLowerCase()),
        endpoint: '/api/orders/:id/status',
        method: 'PUT',
        tone: 'primary',
        confirmTitle: 'Ubah Status Order',
        confirmBody: (r: any) =>
          `Order ${r.order_number || '#' + r.id} sekarang berstatus "${String(r.status || 'pending').replace('_', ' ')}". Memindahkan ke "active" ikut menjalankan project terkait; "cancelled" ikut membatalkannya.`,
        optionsEndpoint: '/api/orders/:id/status-options',
        optionsField: 'status',
        fields: [
          { name: 'status', label: 'Status Berikutnya', type: 'select', required: true, options: [] },
          { name: 'milestone_status', label: 'Milestone / Termin (opsional)' },
          { name: 'note', label: 'Catatan (opsional)', type: 'textarea', rows: 2 },
        ],
        successMessage: 'Status order berhasil diperbarui.',
      },
    ],
  },
  invoices: {
    resource: 'invoices',
    title: 'Invoices Tagihan',
    endpoint: '/api/invoices',
    emptyRow: 'Belum ada invoice dibuat.',
    columns: [
      {
        id: 'number',
        label: 'Nomor Invoice',
        render: (r: any) => (
          <span className="font-mono font-bold text-xs text-text-main px-2.5 py-1 rounded-md bg-canvas-overlay border border-border-minimal">
            {r.number}
          </span>
        ),
      },
      {
        id: 'amount',
        label: 'Jumlah Tagihan',
        render: (r: any) => (
          <span className="font-mono font-bold text-emerald-700 text-sm">
            Rp {Number(r.amount || 0).toLocaleString('id-ID')}
          </span>
        ),
      },
      {
        id: 'status',
        label: 'Status Bayar',
        render: (r: any) => {
          const st = String(r.status || 'draft').toLowerCase()
          const colorMap: Record<string, string> = {
            paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            sent: 'bg-blue-50 text-blue-700 border-blue-200',
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            overdue: 'bg-rose-50 text-rose-700 border-rose-200',
          }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                colorMap[st] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {r.status || 'draft'}
            </span>
          )
        },
      },
      {
        id: 'id',
        label: 'Dokumen',
        render: (r: any) => (
          <button
            type="button"
            onClick={() => window.open(`/api/invoices/${r.id}/pdf`, '_blank')}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
          >
            <span>📄 Unduh PDF</span>
          </button>
        ),
      },
    ],
    formFields: [
      { name: 'number', label: 'Nomor Invoice', required: true },
      { name: 'type', label: 'Jenis Tagihan / Termin' },
      { name: 'amount', label: 'Jumlah Nominal (IDR)', type: 'number', required: true },
      {
        name: 'status',
        label: 'Status Pembayaran',
        type: 'select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent (Terkirim ke Klien)' },
          { value: 'paid', label: 'Paid (Lunas)' },
          { value: 'overdue', label: 'Overdue (Jatuh Tempo)' },
        ],
      },
      { name: 'due_date', label: 'Batas Pembayaran (Due Date)' },
      { name: 'notes', label: 'Catatan Rekening / Instruksi Transfer', type: 'textarea', rows: 3 },
    ],
  },
  clients: {
    resource: 'clients',
    title: 'Klien Terdaftar',
    endpoint: '/api/clients',
    emptyRow: 'Belum ada data klien terdaftar.',
    columns: [
      {
        id: 'company_name',
        label: 'Perusahaan & PIC',
        render: (r: any) => (
          <div>
            <span className="font-bold text-text-main block">{r.company_name || 'Perorangan'}</span>
            <span className="text-[11px] text-text-muted font-mono">PIC: {r.pic_name || '—'}</span>
          </div>
        ),
      },
      {
        id: 'email',
        label: 'Email & WhatsApp',
        render: (r: any) => (
          <div>
            <span className="text-xs text-text-main font-mono block">{r.email || '—'}</span>
            <span className="text-[11px] text-text-muted font-mono">{r.phone || '—'}</span>
          </div>
        ),
      },
      {
        id: 'city',
        label: 'Domisili Kota',
        render: (r: any) => <span className="text-xs text-text-muted">{r.city || '—'}</span>,
      },
    ],
    formFields: [
      { name: 'company_name', label: 'Nama Perusahaan / Brand' },
      { name: 'pic_name', label: 'Nama Penanggung Jawab (PIC)', required: true },
      { name: 'email', label: 'Email Resmi' },
      { name: 'phone', label: 'Nomor WhatsApp / Telepon' },
      { name: 'city', label: 'Kota Domisili' },
      { name: 'address', label: 'Alamat Lengkap', type: 'textarea', rows: 2 },
    ],
  },
  projects: {
    resource: 'projects',
    title: 'Projects',
    endpoint: '/api/projects',
    emptyRow: 'Belum ada project.',
    columns: [
      { id: 'name', label: 'Nama Project', render: (r: any) => <span className="font-bold text-text-main">{r.name}</span> },
      {
        id: 'status',
        label: 'Status',
        render: (r: any) => {
          const st = String(r.status || 'planning').toLowerCase()
          const colorMap: Record<string, string> = {
            planning: 'bg-gray-100 text-gray-700 border-gray-200',
            in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
            review: 'bg-purple-50 text-purple-700 border-purple-200',
            on_hold: 'bg-amber-50 text-amber-700 border-amber-200',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
          }
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${
                colorMap[st] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {st.replace('_', ' ')}
            </span>
          )
        },
      },
      { id: 'deadline', label: 'Deadline', render: (r: any) => r.deadline ? new Date(r.deadline).toLocaleDateString('id-ID') : '—' },
      { id: 'live_url', label: 'Live URL', render: (r: any) => r.live_url ? <a href={r.live_url} target="_blank" rel="noreferrer" className="text-brand-primary underline">Buka</a> : '—' },
    ],
    formFields: [
      { name: 'name', label: 'Nama Project', required: true },
      { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
      { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'planning', label: 'Planning' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'review', label: 'Review' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Cancelled' },
      ] },
      { name: 'deadline', label: 'Deadline', type: 'date' },
      { name: 'repo_url', label: 'Repository URL' },
      { name: 'live_url', label: 'Live URL' },
    ],
    rowActions: [
      {
        id: 'status',
        label: 'Ubah Status',
        // Terminal states have no legal next step, so hide the action entirely.
        visible: (r: any) => !['completed', 'cancelled'].includes(String(r.status || '').toLowerCase()),
        endpoint: '/api/projects/:id/status',
        method: 'PUT',
        tone: 'primary',
        confirmTitle: 'Ubah Status Project',
        confirmBody: (r: any) =>
          `Status sekarang: ${String(r.status || 'planning').replace('_', ' ')}. Pilih status berikutnya yang diizinkan alur kerja.`,
        // Legal next statuses come from the backend state machine, not a hardcoded list,
        // so the UI can never offer an illegal transition.
        optionsEndpoint: '/api/projects/:id/status-options',
        optionsField: 'status',
        fields: [
          { name: 'status', label: 'Status Berikutnya', type: 'select', required: true, options: [] },
          { name: 'note', label: 'Catatan (opsional)', type: 'textarea', rows: 2 },
        ],
        successMessage: 'Status project berhasil diperbarui.',
      },
    ],
  },
  tickets: {
    resource: 'tickets',
    title: 'Tiket Dukungan',
    endpoint: '/api/tickets',
    emptyRow: 'Belum ada tiket kendala.',
    columns: [
      {
        id: 'subject',
        label: 'Subjek Kendala',
        render: (r: any) => <span className="font-bold text-text-main">{r.subject}</span>,
      },
      {
        id: 'priority',
        label: 'Prioritas',
        render: (r: any) => {
          const pr = String(r.priority || 'medium').toLowerCase()
          const colorMap: Record<string, string> = {
            high: 'bg-rose-50 text-rose-700 border-rose-200',
            medium: 'bg-amber-50 text-amber-700 border-amber-200',
            low: 'bg-gray-100 text-gray-700 border-gray-200',
          }
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                colorMap[pr] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {r.priority || 'medium'}
            </span>
          )
        },
      },
      {
        id: 'status',
        label: 'Status Penanganan',
        render: (r: any) => {
          const st = String(r.status || 'open').toLowerCase()
          const colorMap: Record<string, string> = {
            open: 'bg-blue-50 text-blue-700 border-blue-200',
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                colorMap[st] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {r.status || 'open'}
            </span>
          )
        },
      },
    ],
    formFields: [
      { name: 'subject', label: 'Subjek Kendala / Tiket', required: true },
      {
        name: 'priority',
        label: 'Tingkat Prioritas',
        type: 'select',
        options: [
          { value: 'low', label: 'Low (Rendah)' },
          { value: 'medium', label: 'Medium (Sedang)' },
          { value: 'high', label: 'High (Darurat / Mendesak)' },
        ],
      },
      {
        name: 'status',
        label: 'Status Penanganan',
        type: 'select',
        options: [
          { value: 'open', label: 'Open (Baru Dibuka)' },
          { value: 'pending', label: 'Pending (Sedang Dikerjakan)' },
          { value: 'closed', label: 'Closed (Selesai Diselesaikan)' },
        ],
      },
    ],
    rowActions: [
      {
        id: 'status',
        // A closed ticket can be reopened, so the label reflects what the click will do.
        label: (r: any) =>
          String(r.status || '').toLowerCase() === 'closed' ? 'Buka Ulang' : 'Ubah Status',
        endpoint: '/api/tickets/:id/status',
        method: 'PUT',
        tone: 'primary',
        confirmTitle: 'Ubah Status Tiket',
        confirmBody: (r: any) =>
          `Tiket "${r.subject}" sekarang berstatus "${r.status || 'open'}". Pilih status penanganan berikutnya.`,
        optionsEndpoint: '/api/tickets/:id/status-options',
        optionsField: 'status',
        fields: [
          { name: 'status', label: 'Status Berikutnya', type: 'select', required: true, options: [] },
          { name: 'note', label: 'Catatan Penanganan (opsional)', type: 'textarea', rows: 2 },
        ],
        successMessage: 'Status tiket berhasil diperbarui.',
      },
    ],
  },
  testimonials: {
    resource: 'testimonials',
    title: 'Testimoni Klien',
    endpoint: '/api/testimonials',
    emptyRow: 'Belum ada ulasan testimoni.',
    columns: [
      {
        id: 'name',
        label: 'Nama Klien',
        render: (r: any) => (
          <div>
            <span className="font-bold text-text-main block">{r.name}</span>
            <span className="text-[11px] text-text-muted">{r.role || 'Klien'}</span>
          </div>
        ),
      },
      {
        id: 'content',
        label: 'Ulasan / Review',
        render: (r: any) => (
          <p className="text-xs text-text-muted line-clamp-2 max-w-xs">{r.content || '—'}</p>
        ),
      },
      {
        id: 'is_approved',
        label: 'Status Tayang',
        render: (r: any) => renderPublishedBadge(r.is_approved),
      },
    ],
    formFields: [
      { name: 'name', label: 'Nama Klien', required: true },
      { name: 'role', label: 'Posisi / Jabatan / Perusahaan' },
      { name: 'content', label: 'Kutipan Testimonial Klien', type: 'textarea', rows: 4, required: true },
      { name: 'avatar', label: 'URL Foto Profil Avatar' },
      { name: 'sort_order', label: 'Nomor Urutan Tampil', type: 'number' },
      {
        name: 'is_approved',
        label: 'Setujui Tayang di Beranda Publik',
        type: 'select',
        options: [
          { value: '1', label: 'Disetujui (Tayang)' },
          { value: '0', label: 'Tangguhkan (Draft)' },
        ],
      },
    ],
  },
  transactions: {
    resource: 'transactions',
    title: 'Riwayat Transaksi',
    endpoint: '/api/transactions',
    emptyRow: 'Belum ada data transaksi.',
    columns: [
      {
        id: 'transaction_reference',
        label: 'Referensi ID',
        render: (r: any) => (
          <span className="font-mono font-bold text-xs text-text-main">
            {r.transaction_reference || `#${r.id}`}
          </span>
        ),
      },
      {
        id: 'amount',
        label: 'Nominal',
        render: (r: any) => (
          <span className="font-mono font-bold text-emerald-700 text-sm">
            Rp {Number(r.amount || 0).toLocaleString('id-ID')}
          </span>
        ),
      },
      {
        id: 'payment_method',
        label: 'Metode Pembayaran',
        render: (r: any) => (
          <span className="px-2 py-0.5 rounded-md bg-canvas-overlay text-text-main text-xs font-semibold uppercase font-mono">
            {r.payment_method || 'QRIS'}
          </span>
        ),
      },
      {
        id: 'status',
        label: 'Status Transaksi',
        render: (r: any) => {
          const st = String(r.status || 'pending').toLowerCase()
          const colorMap: Record<string, string> = {
            paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            settled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            failed: 'bg-rose-50 text-rose-700 border-rose-200',
            refunded: 'bg-purple-50 text-purple-700 border-purple-200',
          }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                colorMap[st] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {r.status || 'pending'}
            </span>
          )
        },
      },
    ],
    formFields: [
      { name: 'order_id', label: 'Order ID Terkait', type: 'number' },
      { name: 'transaction_reference', label: 'Nomor Referensi Transaksi' },
      { name: 'milestone_name', label: 'Nama Milestone / Termin' },
      { name: 'amount', label: 'Jumlah Transaksi (IDR)', type: 'number' },
      { name: 'payment_method', label: 'Metode Pembayaran (QRIS / VA)' },
      {
        name: 'status',
        label: 'Status Transaksi',
        type: 'select',
        options: [
          { value: 'pending', label: 'Pending (Menunggu Bayar)' },
          { value: 'paid', label: 'Paid / Settled (Berhasil)' },
          { value: 'failed', label: 'Failed (Gagal / Expired)' },
          { value: 'refunded', label: 'Refunded (Dikembalikan)' },
        ],
      },
    ],
  },
}
