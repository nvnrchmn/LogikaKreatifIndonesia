<?php

use Livewire\Volt\Component;
use App\Models\PaymentHub\PhTransaction;
use Livewire\Attributes\Layout;
use Livewire\WithPagination;

new #[Layout('components.layouts.admin', ['title' => 'Payment Hub Transactions'])] class extends Component
{
    use WithPagination;

    public function with(): array
    {
        return [
            'transactions' => PhTransaction::with(['saasApplication', 'subAccount'])->latest()->paginate(15)
        ];
    }
};
?>
<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-display font-bold text-txt-main">Payment Hub Transactions</h2>
            <p class="text-txt-muted text-sm mt-1">Pantau seluruh aliran dana dari ekosistem SaaS Logikraf</p>
        </div>
    </div>

    <div class="bg-canvas-card rounded-2xl border border-border-minimal overflow-hidden">
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