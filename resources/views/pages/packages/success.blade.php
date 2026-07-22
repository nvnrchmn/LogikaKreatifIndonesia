<x-layouts.app title="Pesanan Berhasil | Logika Kreatif Indonesia">
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen">
        <div class="container-narrow max-w-2xl mx-auto">
            <div class="bg-white rounded-3xl p-8 md:p-12 border border-border-minimal shadow-md text-center">
                <div class="w-20 h-20 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>

                <span class="badge-primary mb-3">Transaksi Diterima</span>
                <h1 class="font-display text-3xl font-bold text-txt-main mb-2">Terima Kasih Atas Pemesanan Anda!</h1>
                <p class="text-txt-muted text-sm leading-relaxed mb-8 max-w-md mx-auto">
                    Pembayaran pesanan Anda telah berhasil diproses oleh <strong>Xendit Payment Gateway</strong>. Tim engineer Logikraf siap memulai pengerjaan proyek Anda.
                </p>

                <!-- Order Receipt Card -->
                <div class="bg-canvas-light rounded-2xl p-6 border border-border-minimal text-left mb-8 space-y-4">
                    <div class="flex items-center justify-between border-b border-border-minimal pb-3">
                        <span class="text-xs text-txt-muted uppercase font-semibold">Nomor Pesanan</span>
                        <strong class="font-mono text-brand-primary text-base">{{ $order->order_number }}</strong>
                    </div>
                    <div class="flex items-center justify-between border-b border-border-minimal pb-3">
                        <span class="text-xs text-txt-muted uppercase font-semibold">Paket Layanan</span>
                        <span class="font-bold text-txt-main text-sm">{{ $order->package->name ?? $order->project_name }}</span>
                    </div>
                    <div class="flex items-center justify-between border-b border-border-minimal pb-3">
                        <span class="text-xs text-txt-muted uppercase font-semibold">Nama Pemesan</span>
                        <span class="text-txt-main text-sm">{{ $order->guest_name }}</span>
                    </div>
                    <div class="flex items-center justify-between border-b border-border-minimal pb-3">
                        <span class="text-xs text-txt-muted uppercase font-semibold">Email Terdaftar</span>
                        <span class="text-txt-main text-sm">{{ $order->guest_email }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-txt-muted uppercase font-semibold">Total Pembayaran</span>
                        <strong class="font-display text-txt-main text-lg">{{ $order->formatted_amount }}</strong>
                    </div>
                </div>

                <!-- Next Steps Info -->
                <div class="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-left text-xs text-txt-muted mb-8 flex items-start gap-3">
                    <svg class="w-5 h-5 text-brand-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <div>
                        <strong class="text-txt-main block font-semibold mb-1">Akses Portal Klien Telah Diaktifkan:</strong>
                        <p>Akun Portal Klien telah otomatis dikonfigurasi untuk email <strong>{{ $order->guest_email }}</strong>. Anda dapat login ke portal untuk memantau progres pembuatan website dan mengunggah materi pendukung.</p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="{{ route('client.dashboard') }}" class="btn-primary w-full sm:w-auto px-6 py-3 text-sm">
                        Masuk Portal Klien
                    </a>
                    <a href="{{ route('home') }}" class="w-full sm:w-auto px-6 py-3 rounded-xl border border-border-minimal text-txt-muted hover:text-txt-main hover:border-txt-main transition-colors text-sm font-semibold">
                        Kembali ke Beranda
                    </a>
                </div>
            </div>
        </div>
    </div>
</x-layouts.app>
