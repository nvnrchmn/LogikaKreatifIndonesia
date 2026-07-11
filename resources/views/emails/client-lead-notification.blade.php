<x-mail::message>
# Halo {{ $lead->name }},

Terima kasih telah menghubungi PT. Logika Kreatif Indonesia! Kami telah menerima detail pengajuan proyek Anda.

Tim kami saat ini sedang meninjau informasi yang Anda berikan dan akan segera menghubungi Anda kembali dalam waktu **1x24 jam** untuk mendiskusikan langkah selanjutnya.

---

### Rangkuman Proyek Anda

**Kategori Layanan:** {{ strtoupper($lead->service_category) }}  
**Estimasi Budget:** {{ str_replace('_', ' ', strtoupper($lead->budget_range)) }}  
**Target Launch:** {{ $lead->target_launch ?? 'Tidak ada' }}

**Deskripsi Proyek:**  
{{ $lead->project_description }}

---

Jika Anda memiliki pertanyaan tambahan atau ada detail yang ingin diubah, Anda bisa langsung membalas email ini.

---

### Portal Klien Anda

Sembari menunggu tim kami menghubungi Anda, kami telah membuatkan **Akun Klien** untuk Anda. Melalui portal ini, Anda dapat memantau status proyek dan melihat tagihan (setelah proyek disetujui).

<x-mail::button :url="url('/login')">
Masuk ke Portal Klien
</x-mail::button>

**URL Login:** {{ url('/login') }}  
**Email:** {{ $lead->email }}  
**Password Sementara:** `logikraf123`

*(Mohon segera ganti password Anda setelah berhasil login pertama kali).*

Salam hangat,<br>
**Tim {{ config('app.name', 'Logika Kreatif Indonesia') }}**
</x-mail::message>
