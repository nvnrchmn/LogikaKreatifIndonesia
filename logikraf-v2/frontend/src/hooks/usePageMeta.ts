// CATATAN PENTING (21 Sep):
// Hook ini DULU menimpa document.title, meta description, dan og:title di klien
// dengan string statis "Digital Creative Agency & Software House". Karena dipanggil
// di main.tsx (akar aplikasi), efeknya menghapus meta per-route yang sudah di-inject
// server (spameta.go) — termasuk judul artikel blog dan studi kasus — sehingga
// crawler yang menjalankan JavaScript bisa membaca judul generik yang salah.
//
// Meta per-route kini sepenuhnya ditangani server. Hook dibiarkan sebagai no-op
// supaya pemanggilan di main.tsx tetap valid tanpa perlu diubah.
export default function usePageMeta() {
  return { title: '', description: '' }
}
