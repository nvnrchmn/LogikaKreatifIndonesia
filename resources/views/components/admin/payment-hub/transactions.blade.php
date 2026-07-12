
<div class="space-y-6">
    <div class="flex justify-between items-center border-b border-border-minimal pb-4">
        <div>
            <h2 class="text-3xl font-display font-bold text-txt-main">Data Pembayaran (Payment Hub)</h2>
            <p class="text-txt-muted text-sm mt-1">Pantau seluruh aliran dana dari ekosistem aplikasi terintegrasi.</p>
        </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-canvas-card p-4 rounded-2xl border border-border-minimal shadow-sm">
        <div class="w-full sm:w-1/3 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input wire:model.live.debounce.300ms="search" type="text" placeholder="Cari ID Tagihan, Nama Aplikasi, atau Nama RT..." class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-shadow">
        </div>
        <div class="w-full sm:w-1/4">
            <select wire:model.live="statusFilter" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-xl transition-shadow bg-white">
                <option value="">Semua Status</option>
                <option value="PAID">LUNAS (PAID)</option>
                <option value="PENDING">PENDING</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="FAILED">FAILED</option>
            </select>
        </div>
    </div>

    <div class="bg-canvas-card rounded-2xl border border-border-minimal overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-canvas-light border-b border-border-minimal">
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Aplikasi SaaS</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Tujuan Dana</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">ID Tagihan (Ext)</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Total</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Platform Fee</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Status</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Webhook</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-minimal">
                @forelse($transactions as $tx)
                    <tr class="hover:bg-canvas-light/50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="font-medium text-txt-main">{{ $tx->saasApplication->name }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-txt-main">{{ $tx->subAccount ? $tx->subAccount->business_name : 'Master Account' }}</div>
                            @if($tx->subAccount)
                                <div class="text-xs text-txt-muted">{{ $tx->subAccount->xendit_account_id }}</div>
                            @endif
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-mono text-txt-main">{{ $tx->external_id }}</div>
                            @if($tx->invoice_url)
                                <a href="{{ $tx->invoice_url }}" target="_blank" class="text-xs text-brand-primary hover:underline">Lihat Invoice &rarr;</a>
                            @endif
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-txt-main">Rp {{ number_format($tx->amount, 0, ',', '.') }}</div>
                            <div class="text-xs text-txt-muted">{{ $tx->payment_method ?? '-' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-medium text-green-600">+ Rp {{ number_format($tx->platform_fee_amount, 0, ',', '.') }}</div>
                        </td>
                        <td class="px-6 py-4">
                            @if($tx->status === 'PAID' || $tx->status === 'SETTLED')
                                <span class="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">LUNAS</span>
                            @elseif($tx->status === 'EXPIRED')
                                <span class="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">EXPIRED</span>
                            @else
                                <span class="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">PENDING</span>
                            @endif
                        </td>
                        <td class="px-6 py-4">
                            @if($tx->status === 'PAID')
                                @if($tx->forwarded_to_webhook)
                                    <span class="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Terkirim</span>
                                @else
                                    <span class="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Gagal Forward</span>
                                @endif
                            @else
                                <span class="text-txt-muted text-xs">-</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center text-txt-muted">Belum ada transaksi di Payment Hub.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    <div class="mt-4">
        {{ $transactions->links() }}
    </div>
</div>