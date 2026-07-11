<div x-data="{ snapToken: @entangle('snapToken') }" @open-snap.window="window.snap.pay($event.detail.token, {
    onSuccess: function(result){
        window.location.reload();
    },
    onPending: function(result){
        window.location.reload();
    },
    onError: function(result){
        alert('Pembayaran gagal!');
    },
    onClose: function(){
        // customer closed the popup
    }
})">

    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-3">
                <a href="{{ route('client.orders.index') }}" class="w-8 h-8 flex items-center justify-center rounded-lg bg-canvas-light text-txt-muted hover:text-brand-primary transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                </a>
                <h1 class="font-display text-2xl font-bold text-txt-main">Detail Proyek & Tagihan</h1>
            </div>
            <p class="text-txt-muted text-sm mt-1 ml-11">Order: {{ $order->order_number }}</p>
        </div>
        
        <div class="flex items-center gap-3">
            @if(!in_array($order->status, ['completed', 'cancelled']))
                <button wire:click="cancelOrder" wire:confirm="Apakah Anda yakin ingin membatalkan proyek ini? Semua tagihan yang belum lunas akan dibatalkan otomatis." class="btn bg-status-danger/10 text-status-danger px-4 py-2 rounded-lg text-sm font-semibold hover:bg-status-danger hover:text-white transition-colors">
                    Batalkan Proyek
                </button>
            @endif
            <a href="{{ route('client.orders.pdf', $order->id) }}" target="_blank" class="btn bg-white border border-border-minimal px-4 py-2 rounded-lg text-sm font-semibold hover:bg-canvas-light transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Cetak Invoice
            </a>
        </div>
    </div>

    @if(session('error'))
        <div class="mb-6 p-4 bg-status-danger/10 text-status-danger rounded-lg border border-status-danger/20 text-sm font-medium">
            {{ session('error') }}
        </div>
    @endif
    
    @if(session('success'))
        <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Project Details -->
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm">
                <h3 class="font-display font-semibold text-lg text-txt-main mb-4">Informasi Proyek</h3>
                
                <div class="space-y-4">
                    <div>
                        <p class="text-xs text-txt-muted uppercase tracking-wider mb-1">Nama Proyek</p>
                        <p class="font-medium text-txt-main">{{ $order->project_name }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-txt-muted uppercase tracking-wider mb-1">Layanan</p>
                        <p class="font-medium text-txt-main">{{ $order->service->name ?? '-' }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-txt-muted uppercase tracking-wider mb-1">Status Proyek</p>
                        @if($order->status === 'completed')
                            <span class="badge bg-status-success/10 text-status-success">Selesai</span>
                        @elseif($order->status === 'cancelled')
                            <span class="badge bg-status-danger/10 text-status-danger">Dibatalkan</span>
                        @elseif($order->status === 'in_progress')
                            <span class="badge bg-brand-accent/10 text-brand-accent">Dalam Pengerjaan</span>
                        @else
                            <span class="badge bg-status-warning/10 text-status-warning">Pending</span>
                        @endif
                    </div>
                    <div>
                        <p class="text-xs text-txt-muted uppercase tracking-wider mb-1">Nilai Total Proyek</p>
                        <p class="font-display font-bold text-lg text-brand-primary">{{ $order->formatted_amount }}</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-6">
                <livewire:shared.asset-vault :order_id="$order->id" />
            </div>
            
            <div class="bg-brand-primary p-6 rounded-xl shadow-sm text-white">
                <h3 class="font-display font-semibold text-lg mb-2">Butuh Bantuan?</h3>
                <p class="text-white/80 text-sm mb-4">Hubungi tim account executive kami untuk pertanyaan seputar teknis maupun pembayaran.</p>
                @php
                    $phoneRaw = \App\Models\Setting::get('company_phone', '+62 811-1234-5678');
                    $phone = preg_replace('/[^0-9]/', '', $phoneRaw);
                    $waText = urlencode("Halo Tim Logikraf, saya butuh bantuan mengenai proyek " . $order->project_name . " (Order: " . $order->order_number . ").");
                @endphp
                <a href="https://wa.me/{{ $phone }}?text={{ $waText }}" target="_blank" rel="noopener noreferrer" class="btn w-full justify-center bg-white text-brand-primary text-sm px-4 py-2 rounded-lg font-bold hover:bg-canvas-light transition-all flex items-center gap-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Hubungi Dukungan
                </a>
            </div>
        </div>

        <!-- Right: Milestones & Invoices -->
        <div class="lg:col-span-2">
            <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm">
                <h3 class="font-display font-semibold text-lg text-txt-main mb-6">Tagihan & Milestone</h3>
                
                <div class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-minimal before:to-transparent">
                    
                    @php $hasUnpaid = false; @endphp
                    @foreach($order->transactions as $trx)
                        @if($trx->status !== 'settlement' && $trx->status !== 'cancelled')
                            @if($hasUnpaid) @continue @endif
                            @php $hasUnpaid = true; @endphp
                        @endif
                        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <!-- Icon -->
                            <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm
                                {{ $trx->status === 'settlement' ? 'bg-status-success text-white' : ($trx->status === 'cancelled' ? 'bg-status-danger text-white' : 'bg-canvas-light text-txt-muted') }}">
                                @if($trx->status === 'settlement')
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                @elseif($trx->status === 'cancelled')
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                @else
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                @endif
                            </div>
                            
                            <!-- Card -->
                            <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border {{ $trx->status === 'settlement' ? 'border-status-success/30 bg-status-success/5' : ($trx->status === 'cancelled' ? 'border-status-danger/30 bg-status-danger/5' : 'border-border-minimal bg-white') }} shadow-sm">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <div>
                                        <h4 class="font-bold text-txt-main text-sm">{{ $trx->milestone_name }}</h4>
                                        <p class="text-[10px] text-txt-muted mt-0.5">Inv: {{ $trx->transaction_reference }}</p>
                                    </div>
                                    <div class="text-left sm:text-right">
                                        <p class="font-display font-bold text-brand-primary text-sm">Rp {{ number_format($trx->amount, 0, ',', '.') }}</p>
                                    </div>
                                </div>
                                
                                @if($trx->status === 'settlement')
                                    <div class="flex items-center gap-2 mt-2">
                                        <span class="badge bg-status-success text-white text-[10px] px-2 py-0.5 rounded">Lunas</span>
                                        <span class="text-[10px] text-txt-muted">Pada {{ $trx->settled_at ? \Carbon\Carbon::parse($trx->settled_at)->format('d M Y, H:i') : '' }}</span>
                                    </div>
                                @elseif($trx->status === 'cancelled')
                                    <div class="flex items-center gap-2 mt-2">
                                        <span class="badge bg-status-danger text-white text-[10px] px-2 py-0.5 rounded">Dibatalkan</span>
                                    </div>
                                @else
                                    @if($order->status !== 'cancelled')
                                        <div class="mt-4 pt-4 border-t border-border-minimal" x-data="{ agreed: false }">
                                            <div class="flex items-start gap-2 mb-3">
                                                <input type="checkbox" id="agree_{{ $trx->id }}" x-model="agreed" class="w-3.5 h-3.5 mt-0.5 text-brand-primary border-border-minimal rounded focus:ring-brand-primary cursor-pointer shrink-0">
                                                <label for="agree_{{ $trx->id }}" class="text-xs text-txt-muted cursor-pointer select-none leading-tight">
                                                    Saya telah membaca dan menyetujui <a href="{{ route('terms') }}" target="_blank" class="text-brand-primary hover:underline font-semibold">Syarat & Ketentuan</a> yang berlaku untuk proyek ini.
                                                </label>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span class="badge bg-status-warning/10 text-status-warning text-[10px] px-2 py-0.5 rounded">Menunggu Pembayaran</span>
                                                
                                                <button wire:click="payTransaction({{ $trx->id }})" 
                                                        :disabled="!agreed"
                                                        wire:loading.attr="disabled" 
                                                        :class="!agreed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-primary/90 shadow-sm shadow-brand-primary/30'"
                                                        class="btn bg-brand-primary text-white text-xs px-4 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-2">
                                                    <span wire:loading.remove wire:target="payTransaction({{ $trx->id }})">Bayar Sekarang</span>
                                                    <span wire:loading wire:target="payTransaction({{ $trx->id }})">Memproses...</span>
                                                </button>
                                            </div>
                                        </div>
                                    @else
                                        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-minimal">
                                            <span class="badge bg-status-warning/10 text-status-warning text-[10px] px-2 py-0.5 rounded">Menunggu Pembayaran</span>
                                        </div>
                                    @endif
                                @endif
                            </div>
                        </div>
                    @endforeach
                    
                </div>
            </div>
        </div>
    </div>

    <!-- Diskusi Proyek (Full Width Bottom) -->
    <div class="mt-6">
        <livewire:shared.project-thread :order_id="$order->id" />
    </div>
</div>
