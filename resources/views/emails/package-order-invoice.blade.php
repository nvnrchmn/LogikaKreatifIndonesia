<x-mail::message>
# Halo {{ $order->guest_name }},

Terima kasih telah memesan layanan digital di **PT. Logika Kreatif Indonesia**!

Pesanan Anda dengan nomor **{{ $order->order_number }}** telah berhasil diterbitkan dan siap diproses.

<x-mail::button :url="$transaction->payment_url">
Bayar Invoice Xendit Sekarang
</x-mail::button>

---

### Rincian Pesanan & Tagihan

**Nomor Pesanan:** `{{ $order->order_number }}`  
**Paket Layanan:** {{ $order->package->name ?? $order->project_name }}  
**Total Pembayaran:** **{{ $order->formatted_amount }}**  
**Status Pembayaran:** {{ strtoupper($transaction->status) }}  

*Jika tombol di atas tidak dapat diklik, Anda dapat menyalin tautan berikut ke browser Anda:*  
[{{ $transaction->payment_url }}]({{ $transaction->payment_url }})

---

### Akses Portal Klien Anda

Sistem kami telah mengonfigurasi **Akun Portal Klien** untuk Anda. Melalui portal ini, Anda dapat memantau status pengerjaan proyek, mengirimkan materi/catatan revisi, dan mengunduh berkas tagihan.

<x-mail::button :url="url('/login')">
Masuk ke Portal Klien
</x-mail::button>

**URL Login Portal:** {{ url('/login') }}  
**Email Terdaftar:** {{ $order->guest_email }}  
**Password Sementara:** `logikraf123`  

*(Jika ini adalah pesanan pertama Anda, Anda akan diminta memperbarui password sementara di atas menjadi password rahasia pilihan Anda).*

---

Jika Anda membutuhkan bantuan lebih lanjut, silakan hubungi tim kami melalui WhatsApp atau email dukungan `hello@logikraf.id`.

Salam hangat,<br>
**Tim {{ config('app.name', 'Logika Kreatif Indonesia') }}**
</x-mail::message>
