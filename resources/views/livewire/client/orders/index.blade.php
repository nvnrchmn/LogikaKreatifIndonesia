<div>
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="font-display text-2xl font-bold text-txt-main">My Orders</h1>
            <p class="text-txt-muted text-sm mt-1">Daftar proyek dan status pengerjaan.</p>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-border-minimal flex flex-col md:flex-row gap-4 mb-6 shadow-sm">
        <div class="flex-1">
            <div class="relative">
                <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input wire:model.live.debounce.300ms="search" type="text" placeholder="Cari nama proyek atau nomor order..." class="w-full pl-10 pr-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all">
            </div>
        </div>
        <div class="w-full md:w-48">
            <select wire:model.live="status" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">Dalam Pengerjaan</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
            </select>
        </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-border-minimal rounded-xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-light text-txt-muted text-xs uppercase tracking-wider border-b border-border-minimal">
                        <th class="px-6 py-4 font-medium">Informasi Proyek</th>
                        <th class="px-6 py-4 font-medium">Layanan</th>
                        <th class="px-6 py-4 font-medium">Total Nilai</th>
                        <th class="px-6 py-4 font-medium">Progress Tagihan</th>
                        <th class="px-6 py-4 font-medium text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($orders as $order)
                        <tr class="hover:bg-canvas-light/50 transition-colors group">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $order->project_name }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">{{ $order->order_number }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-sm text-txt-main">{{ $order->service->name ?? '-' }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $order->formatted_amount }}</div>
                                <div class="text-[10px] text-txt-muted mt-1">
                                    @if($order->status === 'completed')
                                        <span class="text-status-success">Lunas</span>
                                    @elseif($order->status === 'cancelled')
                                        <span class="text-status-danger">Batal</span>
                                    @else
                                        Menunggu Pelunasan
                                    @endif
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                @php
                                    $totalTrx = $order->transactions->count();
                                    $paidTrx = $order->transactions->where('status', 'settlement')->count();
                                    $progress = $totalTrx > 0 ? ($paidTrx / $totalTrx) * 100 : 0;
                                @endphp
                                <div class="w-full max-w-[120px]">
                                    <div class="flex justify-between text-xs mb-1">
                                        <span class="text-txt-muted">{{ $paidTrx }}/{{ $totalTrx }} Dibayar</span>
                                        <span class="font-medium text-txt-main">{{ round($progress) }}%</span>
                                    </div>
                                    <div class="h-1.5 w-full bg-border-minimal rounded-full overflow-hidden">
                                        <div class="h-full bg-status-success rounded-full transition-all duration-500" style="width: {{ $progress }}%"></div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('client.orders.show', $order) }}" class="btn bg-brand-primary/10 text-brand-primary text-xs px-4 py-2 hover:bg-brand-primary hover:text-white transition-all font-semibold rounded-lg">
                                    Lihat Detail & Invoice
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-txt-muted">
                                <div class="flex flex-col items-center justify-center">
                                    <svg class="w-12 h-12 text-border-minimal mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                                    <p class="text-sm font-medium text-txt-main">Tidak ada order yang ditemukan.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($orders->hasPages())
            <div class="p-4 border-t border-border-minimal">
                {{ $orders->links() }}
            </div>
        @endif
    </div>
</div>
