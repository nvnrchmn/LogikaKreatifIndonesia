<x-layouts.app title="Pesanan Diterima | Logika Kreatif Indonesia">
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen">
        <div class="container-narrow max-w-xl mx-auto text-center">
            <div class="w-16 h-16 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h1 class="font-display text-3xl font-bold text-txt-main mb-4">Terima Kasih!</h1>
            <p class="text-txt-muted text-sm leading-relaxed mb-2">
                Pesanan <strong>{{ $order->order_number }}</strong> untuk paket <strong>{{ $order->package->name ?? $order->project_name }}</strong> sudah kami terima.
            </p>
            <p class="text-txt-muted text-sm leading-relaxed mb-8">
                Tim kami akan menghubungi Anda melalui email atau WhatsApp yang didaftarkan untuk memulai proses pengerjaan.
            </p>
            <a href="{{ route('home') }}" class="btn-primary inline-block">Kembali ke Beranda</a>
        </div>
    </div>
</x-layouts.app>
