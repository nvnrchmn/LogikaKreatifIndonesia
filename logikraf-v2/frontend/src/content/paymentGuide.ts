// Panduan Payment Hub — Client Store & Settlement (satu sumber konten:
// dirender di UI dan diunduh sebagai .md). Edit di sini saja.
export const PAYMENT_GUIDE_MD = `# Panduan Payment Hub — Client Store & Settlement

Dokumen ini dipakai Logikraf saat membuat project baru untuk klien yang
penjualannya dibayar lewat akun pembayaran Logikraf (contoh: MysticGlide).
Baca urut agar tidak ada langkah terlewat.

---

## 1. Konsep Alur Dana

\`\`\`
Pembeli bayar (via aplikasi client / Xendit Logikraf)
        │
        ▼
Uang masuk ke rekening pembayaran Logikraf
        │
        ▼
Owner client lihat saldo di aplikasinya → klik "Ajukan Pencairan"
        │  (Logikraf dapat notifikasi WhatsApp)
        ▼
Logikraf transfer manual ke rekening owner client
        │
        ▼
Logikraf buka Dashboard Settlement Client → "Tandai Dibayar" + upload bukti transfer
        │
        ▼
Owner client unduh bukti transfer dari aplikasinya (status berubah "Dibayar")
\`\`\`

Poin penting:
- Uang penjualan client TIDAK pernah langsung ke rekening client.
  Semua masuk rekening Logikraf dulu, lalu disetorkan manual.
- Aplikasi hanya mencatat & menghitung. Transfer tetap manual oleh Logikraf.
- Saldo yang bisa dicairkan = pendapatan yang sudah dibayar (PAID) −
  yang sudah disetorkan − pengajuan yang masih menunggu.

---

## 2. Checklist Setup Project Client Baru

Lakukan berurutan. Total ~15 menit jika aplikasi client sudah punya
modul finance (lihat bagian 3).

### Langkah A — Siapkan 3 endpoint internal di aplikasi client
Aplikasi client WAJIB menyediakan API internal (server-to-server) yang
dilindungi header \`X-Internal-Key\`:

1. \`GET  {base}/finance/summary\` — ringkasan keuangan global
2. \`GET  {base}/settlements\` — daftar riwayat pencairan
3. \`PATCH {base}/settlements/{id}/paid\` — tandai dibayar + upload file bukti (multipart: \`proof\`, \`result_note\`)

Detail kontrak API ada di bagian 3.

### Langkah B — Daftarkan store di Dashboard Settlement Client
1. Buka \`logikraf.id/admin/client-settlements\`
2. Klik **+ Tambah Client Store**
3. Isi:
   - **Nama Toko** — mis. "Mystic Glide"
   - **URL Internal (Base URL)** — mis. \`http://127.0.0.1:8095/api/v1/internal\`
     (jika aplikasi client di VPS yang sama, pakai \`127.0.0.1:<port>\`)
   - Slug otomatis dari nama (bisa diubah)
4. Klik **Buat & Generate Key** → Logikraf otomatis membuat key acak
5. **Salin key** — key hanya tampil SEKALI di modal ini

### Langkah C — Pasang key di aplikasi client
- Simpan key sebagai nilai env aplikasi client, mis. \`MG_INTERNAL_KEY=<key>\`
- Pastikan aplikasi client membandingkan header \`X-Internal-Key\` dengan env ini
- Restart aplikasi client

### Langkah D — Verifikasi
- Di halaman Settlement Client klik **Muat Ulang**
- Store muncul dengan status **Aktif** dan kartu datanya hijau/terisi
- Jika merah "tidak terjangkau": cek URL internal, key, dan firewall

### Langkah E — Uji alur settlement sekali
1. Di aplikasi client: ajukan pencairan kecil (mis. Rp 1.000)
2. Tunggu notif WhatsApp → di Dashboard Settlement Client klik **Tandai Dibayar**
3. Upload file bukti (foto/PDF) + keterangan transfer → Konfirmasi
4. Di aplikasi client: status berubah "Dibayar" dan tombol **Unduh bukti transfer** muncul

---

## 3. Kontrak API Internal (harus dipenuhi aplikasi client)

Semua endpoint di bawah BASE URL yang didaftarkan, header wajib:
\`\`\`
X-Internal-Key: <key yang di-generate Logikraf>
\`\`\`

### 3.1 GET {base}/finance/summary
Response sukses (200):
\`\`\`json
{ "data": {
    "total_revenue": 4080000,
    "product_revenue": 4000000,
    "shipping_total": 80000,
    "pending_total": 0,
    "settled_total": 0,
    "outstanding": 4080000,
    "available_for_payout": 4080000
} }
\`\`\`

### 3.2 GET {base}/settlements
\`\`\`json
{ "data": [ {
    "id": 8, "amount": 150000, "note": "Pencairan periode 1",
    "status": "pending",
    "result_note": "",
    "proof_path": "",
    "created_at": "2026-09-07T10:00:00+07:00",
    "paid_at": null
} ] }
\`\`\`
Status: \`pending\` (menunggu) atau \`paid\` (sudah ditransfer).
\`proof_path\` terisi setelah Logikraf upload bukti.

### 3.3 PATCH {base}/settlements/{id}/paid
Body multipart/form-data:
- \`proof\` — file bukti transfer (wajib)
- \`result_note\` — keterangan transfer (opsional, mis. "BCA ref #123")

Response: \`{ "message": "marked paid" }\`

Catatan implementasi (Go Fiber + GORM):
- Key dibaca dari env, bandingkan constant-time (jangan pakai \`==\` string biasa)
- File bukti disimpan di folder upload aplikasi client & diserve publik
  (contoh MG: simpan ke \`uploads/settlements/\`, serve via \`/uploads/*\`)
- \`proof_path\` berisi URL path file (mis. \`/uploads/settlements/settlement-8-1725.pdf\`)
- Kolom settlement minimal: \`id, amount, note, status, result_note, proof_path, created_at, paid_at\`

---

## 4. Operasional Harian

| Siapa | Kapan | Aksi |
|---|---|---|
| Owner client | Mau cairkan dana | Ajukan Pencairan di aplikasinya (nominal ≤ saldo) |
| Logikraf | Ada notif WA pengajuan | Transfer manual → buka Dashboard Settlement Client |
| Logikraf | Setelah transfer | Tandai Dibayar + upload bukti + keterangan |
| Owner client | Status jadi Dibayar | Unduh bukti transfer untuk arsip/pembukuan |

Aturan saldo:
- Owner TIDAK bisa mengajukan melebihi saldo tersedia (aplikasi client memblokir)
- Pengajuan yang masih "Menunggu" ikut mengurangi saldo yang bisa diajukan

---

## 5. Keamanan & Perawatan

- **Key internal = rahasia** — setara password API. Jangan taruh di kode
  frontend / repository publik.
- **Key bocor / karyawan keluar?** → Dashboard Settlement Client →
  **Regenerate** → key lama langsung mati → pasang key baru di aplikasi client.
- **Client berhenti berlangganan?** → **Nonaktifkan** store (pantauan berhenti,
  data tetap tersimpan) atau **Hapus** bila data boleh dibuang.
- Bukti transfer tersimpan di aplikasi client (folder upload) — pastikan
  backup mencakup folder tersebut.

---

## 6. Catatan Kunci (jangan lupa)

1. Uang client selalu lewat rekening Logikraf dulu — tidak pernah langsung.
2. Transaksi di ledger logikraf.id (\`payment_transactions\`) hanya mencatat
   penjualan logikraf.id sendiri. Data client store hidup di aplikasi client
   dan ditarik live via API internal — tidak disalin ke DB Logikraf.
3. Kalau client baru butuh waktu cepat: cukup ikuti Langkah A–D di bagian 2;
   sisa alur settlement otomatis bekerja.
`
