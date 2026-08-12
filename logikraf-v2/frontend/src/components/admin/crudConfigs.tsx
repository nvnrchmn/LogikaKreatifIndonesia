// Central registry for admin CRUD resources.
// One source of truth replaces the 11 per-resource page files.
// ponytail: columns/formFields typed loosely (any) because render fns vary per resource.

export interface ColumnDef {
  id: string
  label: string
  render?: (row: any) => any
}

export interface FieldDef {
  name: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select'
  required?: boolean
  multiline?: boolean
  rows?: number
  options?: { value: string; label: string }[]
  min?: number
  pattern?: string
}

export interface ResourceConfig {
  resource: string        // url slug, e.g. "services"
  title: string           // human title, e.g. "Layanan"
  endpoint: string        // api base, e.g. "/api/services"
  columns: ColumnDef[]
  formFields: FieldDef[]
  emptyRow: string
}

export const crudConfigs: Record<string, ResourceConfig> = {
  services: {
    resource: 'services', title: 'Layanan', endpoint: '/api/services',
    emptyRow: 'Belum ada layanan.',
    columns: [
      { id: 'name', label: 'Nama' },
      { id: 'slug', label: 'Slug' },
      { id: 'short_desc', label: 'Deskripsi' },
      { id: 'is_active', label: 'Aktif', render: (r: any) => r.is_active ? 'Ya' : 'Tidak' },
    ],
    formFields: [
      { name: 'name', label: 'Nama Layanan', required: true },
      { name: 'slug', label: 'Slug', required: true },
      { name: 'short_desc', label: 'Deskripsi Singkat', required: true },
      { name: 'content', label: 'Konten', type: 'textarea', rows: 4 },
      { name: 'color', label: 'Warna', required: true },
      { name: 'icon', label: 'Icon' },
    ],
  },
  portfolios: {
    resource: 'portfolios', title: 'Portofolio', endpoint: '/api/portfolios',
    emptyRow: 'Belum ada portofolio.',
    columns: [
      { id: 'title', label: 'Judul' },
      { id: 'slug', label: 'Slug' },
      { id: 'client_name', label: 'Klien', render: (r: any) => r.client_name || '-' },
      { id: 'is_published', label: 'Published', render: (r: any) => r.is_published ? 'Ya' : 'Tidak' },
    ],
    formFields: [
      { name: 'title', label: 'Judul', required: true },
      { name: 'slug', label: 'Slug', required: true },
      { name: 'client_name', label: 'Nama Klien' },
      { name: 'excerpt', label: 'Excerpt' },
      { name: 'description', label: 'Konten', type: 'textarea', rows: 4 },
      { name: 'thumbnail', label: 'URL Gambar' },
      { name: 'is_published', label: 'Published', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
    ],
  },
  packages: {
    resource: 'packages', title: 'Paket Layanan', endpoint: '/api/packages',
    emptyRow: 'Belum ada paket.',
    columns: [
      { id: 'name', label: 'Nama' },
      { id: 'slug', label: 'Slug' },
      { id: 'price', label: 'Harga', render: (r: any) => `Rp ${Number(r.price).toLocaleString('id-ID')}` },
      { id: 'is_featured', label: 'Featured', render: (r: any) => r.is_featured ? 'Ya' : 'Tidak' },
      { id: 'is_active', label: 'Aktif', render: (r: any) => r.is_active ? 'Ya' : 'Tidak' },
    ],
    formFields: [
      { name: 'name', label: 'Nama Paket', required: true },
      { name: 'slug', label: 'Slug', required: true },
      { name: 'tagline', label: 'Tagline' },
      { name: 'price', label: 'Harga', type: 'number', required: true, min: 0 },
      { name: 'strike_price', label: 'Harga Coret', type: 'number', min: 0 },
      { name: 'features', label: 'Fitur', type: 'textarea', rows: 4 },
      { name: 'is_featured', label: 'Featured', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
      { name: 'is_active', label: 'Aktif', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
    ],
  },
  blog: {
    resource: 'blog', title: 'Blog', endpoint: '/api/posts',
    emptyRow: 'Belum ada post.',
    columns: [
      { id: 'title', label: 'Judul' },
      { id: 'slug', label: 'Slug' },
      { id: 'is_published', label: 'Published', render: (r: any) => r.is_published ? 'Ya' : 'Tidak' },
    ],
    formFields: [
      { name: 'title', label: 'Judul', required: true },
      { name: 'slug', label: 'Slug', required: true },
      { name: 'excerpt', label: 'Excerpt' },
      { name: 'body', label: 'Body', type: 'textarea', rows: 6 },
      { name: 'featured_image', label: 'URL Gambar' },
      { name: 'is_published', label: 'Published', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
    ],
  },
  leads: {
    resource: 'leads', title: 'Leads', endpoint: '/api/leads',
    emptyRow: 'Belum ada lead.',
    columns: [
      { id: 'name', label: 'Nama' },
      { id: 'email', label: 'Email' },
      { id: 'company', label: 'Perusahaan', render: (r: any) => r.company || '-' },
      { id: 'service_category', label: 'Kategori', render: (r: any) => r.service_category || '-' },
      { id: 'status', label: 'Status', render: (r: any) => r.status || 'new' },
      { id: 'lead_score', label: 'Skor' },
    ],
    formFields: [
      { name: 'name', label: 'Nama', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'company', label: 'Perusahaan' },
      { name: 'service_category', label: 'Kategori Layanan' },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'qualified', label: 'Qualified' }, { value: 'lost', label: 'Lost' }] },
      { name: 'lead_score', label: 'Lead Score', type: 'number', min: 0 },
      { name: 'notes', label: 'Catatan', type: 'textarea', rows: 3 },
    ],
  },
  orders: {
    resource: 'orders', title: 'Orders', endpoint: '/api/orders',
    emptyRow: 'Belum ada order.',
    columns: [
      { id: 'order_number', label: 'Nomor', render: (r: any) => r.order_number || '-' },
      { id: 'project_name', label: 'Proyek' },
      { id: 'total_amount', label: 'Total', render: (r: any) => `Rp ${Number(r.total_amount || 0).toLocaleString('id-ID')}` },
      { id: 'status', label: 'Status', render: (r: any) => r.status || 'pending' },
      { id: 'milestone_status', label: 'Milestone', render: (r: any) => r.milestone_status || '-' },
    ],
    formFields: [
      { name: 'order_number', label: 'Nomor Order' },
      { name: 'project_name', label: 'Nama Proyek', required: true },
      { name: 'total_amount', label: 'Total Amount', type: 'number', required: true, min: 0 },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
      { name: 'milestone_status', label: 'Milestone Status' },
    ],
  },
  invoices: {
    resource: 'invoices', title: 'Invoices', endpoint: '/api/invoices',
    emptyRow: 'Belum ada invoice.',
    columns: [
      { id: 'number', label: 'Nomor' },
      { id: 'type', label: 'Tipe' },
      { id: 'amount', label: 'Jumlah', render: (r: any) => `Rp ${Number(r.amount || 0).toLocaleString('id-ID')}` },
      { id: 'status', label: 'Status', render: (r: any) => r.status || '-' },
      { id: 'id', label: 'PDF', render: (r: any) => <button key={r.id} onClick={() => window.open(`/api/invoices/${r.id}/pdf`, '_blank')} className="text-brand-primary hover:underline text-sm">PDF</button> },
    ],
    formFields: [
      { name: 'number', label: 'Nomor Invoice', required: true },
      { name: 'type', label: 'Tipe' },
      { name: 'amount', label: 'Jumlah', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }] },
      { name: 'due_date', label: 'Due Date' },
      { name: 'notes', label: 'Catatan', type: 'textarea', rows: 3 },
    ],
  },
  clients: {
    resource: 'clients', title: 'Clients', endpoint: '/api/clients',
    emptyRow: 'Belum ada client.',
    columns: [
      { id: 'company_name', label: 'Perusahaan', render: (r: any) => r.company_name || r.pic_name || '-' },
      { id: 'email', label: 'Email' },
      { id: 'phone', label: 'Phone' },
      { id: 'city', label: 'Kota' },
    ],
    formFields: [
      { name: 'company_name', label: 'Nama Perusahaan' },
      { name: 'pic_name', label: 'PIC', required: true },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' },
      { name: 'city', label: 'Kota' },
      { name: 'address', label: 'Alamat', type: 'textarea', rows: 2 },
    ],
  },
  tickets: {
    resource: 'tickets', title: 'Tickets', endpoint: '/api/tickets',
    emptyRow: 'Belum ada ticket.',
    columns: [
      { id: 'subject', label: 'Subject' },
      { id: 'priority', label: 'Priority', render: (r: any) => r.priority || 'medium' },
      { id: 'status', label: 'Status', render: (r: any) => r.status || 'open' },
    ],
    formFields: [
      { name: 'subject', label: 'Subject', required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'pending', label: 'Pending' }, { value: 'closed', label: 'Closed' }] },
    ],
  },
  testimonials: {
    resource: 'testimonials', title: 'Testimonials', endpoint: '/api/testimonials',
    emptyRow: 'Belum ada testimonial.',
    columns: [
      { id: 'name', label: 'Nama' },
      { id: 'role', label: 'Role', render: (r: any) => r.role || '-' },
      { id: 'content', label: 'Testimonial', render: (r: any) => (r.content || '').slice(0, 60) + '...' },
      { id: 'is_approved', label: 'Approved', render: (r: any) => r.is_approved ? 'Ya' : 'Tidak' },
    ],
    formFields: [
      { name: 'name', label: 'Nama Klien', required: true },
      { name: 'role', label: 'Role / Posisi' },
      { name: 'content', label: 'Testimonial', type: 'textarea', rows: 4, required: true },
      { name: 'avatar', label: 'URL Avatar' },
      { name: 'sort_order', label: 'Urutan', type: 'number' },
      { name: 'is_approved', label: 'Approved', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
    ],
  },
  transactions: {
    resource: 'transactions', title: 'Transactions', endpoint: '/api/transactions',
    emptyRow: 'Belum ada transaksi.',
    columns: [
      { id: 'order_id', label: 'Order' },
      { id: 'transaction_reference', label: 'Referensi' },
      { id: 'milestone_name', label: 'Milestone' },
      { id: 'amount', label: 'Jumlah', render: (r: any) => `Rp ${Number(r.amount || 0).toLocaleString('id-ID')}` },
      { id: 'payment_method', label: 'Metode' },
      { id: 'status', label: 'Status', render: (r: any) => r.status || '-' },
    ],
    formFields: [
      { name: 'order_id', label: 'Order ID', type: 'number' },
      { name: 'transaction_reference', label: 'Referensi' },
      { name: 'milestone_name', label: 'Milestone' },
      { name: 'amount', label: 'Jumlah', type: 'number' },
      { name: 'payment_method', label: 'Metode Pembayaran' },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }] },
    ],
  },
}
