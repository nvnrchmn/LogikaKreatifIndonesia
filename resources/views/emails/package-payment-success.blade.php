<x-mail::message>
# Pembayaran Anda Berhasil & Lunas! 🎉

Halo **{{ $order->guest_name }}**,

Selamat! Pembayaran Anda sebesar **{{ $order->formatted_amount }}** telah berhasil diterima dan diverifikasi oleh sistem pembayaran kami via Xendit Payment Gateway.

Tim engineer Logika Kreatif Indonesia telah menerima pesanan Anda dan langsung memproses tahap *kickoff* pengerjaan proyek.

---

### Bukti & Rincian Pembayaran Lunas

**Nomor Pesanan:** `{{ $order->order_number }}`  
**Paket Layanan:** {{ $order->package->name ?? $order->project_name }}  
**Total Dibayar:** **{{ $order->formatted_amount }}**  
**Metode Pembayaran:** {{ strtoupper($transaction->raw_gateway_response['payment_method'] ?? 'XENDIT GATEWAY') }}  
**Status Pembayaran:** **LUNAS (PAID / SETTLED)**  
**Waktu Pembayaran:** {{ now()->format('d M Y, H:i') }} WIB  

---

### Kredensial & Akses Portal Klien

Progres pembuatan website Anda dapat dipantau secara real-time melalui **Portal Klien Logikraf**.

<x-mail::button :url="url('/login')">
Masuk ke Portal Klien Sekarang
</x-mail::button>

**Informasi Akses Login Portal:**  
- **URL Login:** {{ url('/login') }}  
- **Email:** `{{ $order->guest_email }}`  
- **Password Sementara:** `logikraf123`  

*(Jika Anda sudah mengganti password sementara pada login pertama, silakan gunakan password baru yang telah Anda buat).*

---

### Langkah Selanjutnya
1. Tim kami akan menghubungi Anda via WhatsApp di `{{ $order->guest_phone }}` atau email ini untuk mengonfirmasi materi & brief.
2. Anda dapat mengunggah file logo, konten, dan foto pendukung langsung melalui Portal Klien.

Jika ada pertanyaan, jangan ragu untuk menghubungi kami via email `hello@logikraf.id` atau WhatsApp.

Salam hangat,<br>
**Tim {{ config('app.name', 'Logika Kreatif Indonesia') }}**
</x-mail::message>
