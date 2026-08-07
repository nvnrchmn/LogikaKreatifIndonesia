<x-layouts.admin title="Detail Pesanan">
    <div class="space-y-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <a href="{{ route('admin.orders.index') }}" class="w-8 h-8 flex items-center justify-center rounded-lg bg-canvas-light text-txt-muted hover:text-brand-primary transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                </a>
                <h2 class="font-display text-2xl font-bold text-txt-main">Detail Pesanan</h2>
            </div>
            <p class="text-txt-muted text-sm mt-1">Order: {{ $order->order_number }}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Kolom Kiri: Detail -->
            <div class="lg:col-span-1 space-y-6">
                <div class="card p-6">
                    <h3 class="font-display font-semibold text-lg text-txt-main mb-4">Informasi Proyek</h3>
                    <dl class="space-y-4 text-sm">
                        <div>
                            <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Nama Proyek</dt>
                            <dd class="font-medium text-txt-main">{{ $order->project_name }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Klien</dt>
                            <dd class="font-medium text-txt-main">{{ $order->user->name }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Status Proyek</dt>
                            <dd>
                                @if($order->status === 'completed')
                                    <span class="badge bg-status-success/10 text-status-success">Selesai</span>
                                @elseif($order->status === 'cancelled')
                                    <span class="badge bg-status-danger/10 text-status-danger">Dibatalkan</span>
                                @elseif($order->status === 'in_progress')
                                    <span class="badge bg-brand-accent/10 text-brand-accent">Dalam Pengerjaan</span>
                                @else
                                    <span class="badge bg-status-warning/10 text-status-warning">Pending</span>
                                @endif
                            </dd>
                        </div>
                        <div>
                            <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Nilai Total Proyek</dt>
                            <dd class="font-display font-bold text-lg text-brand-primary">{{ $order->formatted_amount }}</dd>
                        </div>
                    </dl>
                </div>
                
                <!-- WhatsApp Notify -->
                @php
                    $waNumber = '089530854594';
                    $waMsg = 'Halo ' . ($order->user->name ?? $order->guest_name) . ', ini dari Logikraf mengenai proyek "' . $order->project_name . '" (Order: ' . $order->order_number . '). Status saat ini: ' . ucfirst(str_replace('_', ' ', $order->status)) . '.';
                    $waLink = 'https://wa.me/' . $waNumber . '?text=' . urlencode($waMsg);
                @endphp
                <div class="card p-6">
                    <h3 class="font-display font-semibold text-lg text-txt-main mb-3">Notifikasi WhatsApp</h3>
                    <p class="text-xs text-txt-muted mb-3">Kirim update proyek ke klien via WA (nomor bisnis Logikraf).</p>
                    <a href="{{ $waLink }}" target="_blank" rel="noopener"
                        class="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Chat ke Klien
                    </a>
                </div>

                <!-- AssetVault Component -->
                <livewire:shared.asset-vault :order_id="$order->id" />
            </div>

            <!-- Kolom Kanan: Chat & Kanban -->
            <div class="lg:col-span-2 space-y-6">
                <livewire:shared.project-thread :order_id="$order->id" />
                <livewire:admin.orders.kanban-board :order="$order" />
            </div>
        </div>
    </div>
</x-layouts.admin>