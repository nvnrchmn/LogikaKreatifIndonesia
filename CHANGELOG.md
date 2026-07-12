# Changelog

Semua perubahan yang signifikan pada proyek ini (Logika Kreatif Indonesia) akan dicatat di file ini.
Format log mengikuti pedoman standar Changelog.

## [Unreleased] - 2026-07-12
### Added (Fase 1)
- **Asset Vault:** Fitur untuk berbagi file (mengunggah/mengunduh) di dalam halaman Detail Order untuk Admin dan Klien. Terintegrasi dengan storage dan role base access.
- **Project Thread:** Fitur *In-App Messaging* untuk berdiskusi antara Admin dan Klien di dalam halaman Detail Order.

### Fixed
- Memperbaiki Error 500 pada format tanggal `settled_at` untuk Order yang sudah Lunas.
- Memperbaiki error `View not found` pada komponen *single-file* Livewire.
- Memperbaiki *curl 415 error* pada GitHub Actions Deployment Webhook.
- Merapikan posisi kolom, padding, border, dan CSS UI (Tailwind) pada portal agar sinkron dengan file CSS *production*.

