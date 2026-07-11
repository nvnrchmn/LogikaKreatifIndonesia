<x-mail::message>
# Halo Admin, Ada Lead Baru Masuk!

Seseorang baru saja mengisi formulir konsultasi (Project Brief) di website.

**Detail Kontak:**
- **Nama:** {{ $lead->name }}
- **Email:** {{ $lead->email }}
- **Perusahaan:** {{ $lead->company ?? '-' }}
- **Telepon:** {{ $lead->phone ?? '-' }}

**Detail Proyek:**
- **Layanan:** {{ ucfirst($lead->service_category) }}
- **Estimasi Budget:** {{ $lead->budget_label }}
- **Target Launch:** {{ $lead->target_launch ?? '-' }}

**Deskripsi Proyek:**
> {{ $lead->project_description }}

**Lead Score:** {{ $lead->lead_score }}

<x-mail::button :url="route('admin.leads.index')">
Lihat di Dashboard Admin
</x-mail::button>

Terima kasih,<br>
Sistem Notifikasi {{ config('app.name') }}
</x-mail::message>
