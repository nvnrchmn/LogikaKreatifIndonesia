<div>
    <div class="mb-6">
        <h1 class="font-display text-2xl font-bold text-txt-main">Laporan Keuangan</h1>
        <p class="text-txt-muted text-sm mt-1">Ringkasan invoice & revenue (hanya tipe Invoice, bukan Quotation).</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-5 rounded-xl border border-border-minimal shadow-sm">
            <p class="text-xs text-txt-muted uppercase tracking-wide">Total Invoice</p>
            <p class="text-2xl font-bold text-txt-main mt-2">Rp {{ number_format($totalAll, 0, ',', '.') }}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-border-minimal shadow-sm">
            <p class="text-xs text-txt-muted uppercase tracking-wide">Sudah Dibayar</p>
            <p class="text-2xl font-bold text-status-success mt-2">Rp {{ number_format($paid, 0, ',', '.') }}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-border-minimal shadow-sm">
            <p class="text-xs text-txt-muted uppercase tracking-wide">Belum Dibayar</p>
            <p class="text-2xl font-bold text-status-warning mt-2">Rp {{ number_format($unpaid, 0, ',', '.') }}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-border-minimal shadow-sm">
            <p class="text-xs text-txt-muted uppercase tracking-wide">Dibatalkan</p>
            <p class="text-2xl font-bold text-txt-muted mt-2">Rp {{ number_format($cancelled, 0, ',', '.') }}</p>
        </div>
    </div>

    <!-- Monthly Revenue -->
    <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm mb-6">
        <h3 class="font-display font-semibold text-lg text-txt-main mb-4">Revenue per Bulan (Invoice Paid)</h3>
        <div class="space-y-3">
            @foreach ($monthly as $m)
                @php
                    $max = max($monthly->max('revenue'), 1);
                    $pct = $m['revenue'] > 0 ? round($m['revenue'] / $max * 100) : 0;
                @endphp
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-txt-muted">{{ $m['label'] }}</span>
                        <span class="font-medium text-txt-main">Rp {{ number_format($m['revenue'], 0, ',', '.') }}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                        <div class="bg-brand-primary h-2 rounded-full" style="width: {{ $pct }}%"></div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Recent Invoices -->
    <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm">
        <h3 class="font-display font-semibold text-lg text-txt-main mb-4">10 Invoice Terbaru</h3>
        <table class="w-full text-sm">
            <thead class="bg-gray-50 text-txt-muted">
                <tr>
                    <th class="text-left p-3 font-medium">No.</th>
                    <th class="text-left p-3 font-medium">Klien</th>
                    <th class="text-left p-3 font-medium">Tanggal</th>
                    <th class="text-left p-3 font-medium">Total</th>
                    <th class="text-left p-3 font-medium">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-minimal">
                @forelse ($recent as $inv)
                    <tr>
                        <td class="p-3">{{ $inv->number }}</td>
                        <td class="p-3">{{ $inv->client_name }}</td>
                        <td class="p-3">{{ $inv->issue_date?->format('d M Y') ?? '-' }}</td>
                        <td class="p-3 font-semibold">Rp {{ number_format($inv->total, 0, ',', '.') }}</td>
                        <td class="p-3">
                            <span class="text-xs px-2 py-1 rounded-full
                                @switch($inv->status)
                                    @case('paid') bg-green-100 text-green-700 @break
                                    @case('cancelled') bg-gray-100 text-gray-700 @break
                                    @default bg-yellow-100 text-yellow-700
                                @endswitch
                            ">{{ ucfirst($inv->status) }}</span>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-6 text-center text-txt-muted">Belum ada invoice.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
