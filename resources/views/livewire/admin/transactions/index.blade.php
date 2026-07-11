<div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Semua Transaksi</h2>
        
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input wire:model.live="search" type="text" class="form-input text-sm py-2" placeholder="Cari No. TRX, No. Order...">
            <select wire:model.live="statusFilter" class="form-input text-sm py-2">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="settlement">Settlement (Lunas)</option>
                <option value="expire">Expire / Gagal</option>
            </select>
        </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">Nomor Transaksi</th>
                        <th class="px-6 py-4">Proyek & Milestone</th>
                        <th class="px-6 py-4">Jumlah (Rp)</th>
                        <th class="px-6 py-4">Status Pembayaran</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($transactions as $trx)
                        <tr class="hover:bg-canvas-light transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $trx->transaction_reference }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">{{ $trx->created_at->format('d M Y H:i') }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-semibold text-brand-primary">{{ $trx->order->project_name ?? '-' }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">{{ $trx->milestone_name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ number_format($trx->amount, 0, ',', '.') }}</div>
                            </td>
                            <td class="px-6 py-4">
                                @if($trx->status === 'settlement')
                                    <span class="badge bg-status-success/10 text-status-success text-[10px]">Lunas</span>
                                    <div class="text-[10px] text-txt-muted mt-1">Pada: {{ $trx->settled_at ? \Carbon\Carbon::parse($trx->settled_at)->format('d M Y') : '-' }}</div>
                                @elseif($trx->status === 'pending')
                                    <span class="badge bg-status-warning/10 text-status-warning text-[10px]">Menunggu Pembayaran</span>
                                @else
                                    <span class="badge bg-status-danger/10 text-status-danger text-[10px]">Gagal / Expired</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                @if($trx->status === 'pending')
                                    <button wire:click="markAsPaid({{ $trx->id }})" wire:confirm="Tandai lunas manual? Ini akan mengubah status order secara otomatis." class="text-status-success hover:underline text-xs font-medium">Set Lunas</button>
                                    <button wire:click="markAsFailed({{ $trx->id }})" wire:confirm="Batalkan transaksi ini?" class="text-status-danger hover:underline text-xs font-medium">Set Gagal</button>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-txt-muted text-sm">Tidak ada data transaksi.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($transactions->hasPages())
            <div class="px-6 py-4 border-t border-border-minimal">
                {{ $transactions->links() }}
            </div>
        @endif
    </div>
</div>
