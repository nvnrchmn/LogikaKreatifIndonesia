<div class="space-y-6">
    <div class="flex justify-between items-center border-b border-border-minimal pb-4">
        <div>
            <h2 class="text-3xl font-display font-bold text-txt-main">Penarikan Dana (Disbursements)</h2>
            <p class="text-txt-muted text-sm mt-1">Riwayat penarikan dana dari Sub-Account Xendit klien SaaS Anda.</p>
        </div>
    </div>

    <div class="flex items-center gap-4">
        <div class="flex-1 max-w-sm relative">
            <input type="text" wire:model.live.debounce.300ms="search" placeholder="Cari ID, Nama Akun, atau No Rekening..." class="input w-full pl-10">
            <svg class="w-5 h-5 text-txt-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <select wire:model.live="status" class="input w-48">
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Berhasil</option>
            <option value="FAILED">Gagal</option>
        </select>
    </div>

    <div class="bg-canvas-card rounded-2xl border border-border-minimal overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-light border-b border-border-minimal">
                        <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Tanggal & Waktu</th>
                        <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Aplikasi & Sub-Akun</th>
                        <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Referensi</th>
                        <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Tujuan Transfer</th>
                        <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Nominal</th>
                        <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($disbursements as $disb)
                        <tr class="hover:bg-canvas-light/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-txt-main">{{ $disb->created_at->format('d/m/Y') }}</div>
                                <div class="text-xs text-txt-muted">{{ $disb->created_at->format('H:i') }} WIB</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-txt-main">{{ $disb->saasApplication->name }}</div>
                                <div class="text-xs text-txt-muted">{{ $disb->subAccount->business_name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-txt-main">{{ $disb->external_id }}</div>
                                @if($disb->xendit_disbursement_id)
                                    <div class="text-xs text-txt-muted">{{ $disb->xendit_disbursement_id }}</div>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-txt-main">{{ strtoupper($disb->bank_code) }} - {{ $disb->account_number }}</div>
                                <div class="text-xs text-txt-muted">{{ $disb->account_holder_name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-brand-primary">Rp {{ number_format($disb->amount, 0, ',', '.') }}</div>
                            </td>
                            <td class="px-6 py-4">
                                @if($disb->status === 'COMPLETED')
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div> Berhasil
                                    </span>
                                @elseif($disb->status === 'PENDING')
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                        <div class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div> Pending
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                        <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div> Gagal
                                    </span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-txt-muted">
                                <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Belum ada riwayat penarikan dana.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    
    <div class="mt-4">
        {{ $disbursements->links() }}
    </div>
</div>
