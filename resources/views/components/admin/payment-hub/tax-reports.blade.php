<div class="space-y-6">
    <div class="flex justify-between items-center border-b border-border-minimal pb-4">
        <div>
            <h2 class="text-3xl font-display font-bold text-txt-main">Laporan Pajak</h2>
            <p class="text-txt-muted text-sm mt-1">Rekapitulasi perhitungan PPh Final 0.5% (PP 55/2022) untuk omzet PT Perorangan dari Payment Hub.</p>
        </div>
    </div>

    <!-- Alert / Info -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex gap-3 shadow-sm">
        <svg class="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <div>
            <h4 class="font-bold text-blue-800">Catatan Pajak PT Perorangan</h4>
            <p class="text-sm text-blue-700 mt-1">
                Karena Logikraf merupakan PT Perorangan dengan omzet &lt; Rp 4.8 Miliar/tahun, dasar pengenaan pajaknya adalah <b>0.5% dari peredaran bruto (Omzet)</b>. 
                Dalam konteks Payment Hub, omzet Logikraf adalah total keuntungan dari <b>Platform Fee</b>, bukan total uang yang dibayarkan oleh warga (karena uang warga diteruskan ke Sub-Account).
            </p>
        </div>
    </div>

    <!-- Table Section -->
    <div class="bg-canvas-card rounded-2xl border border-border-minimal overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50/50 border-b border-border-minimal text-txt-muted text-xs uppercase tracking-wider">
                        <th class="px-6 py-4 font-semibold">Periode (Bulan)</th>
                        <th class="px-6 py-4 font-semibold">Total Transaksi</th>
                        <th class="px-6 py-4 font-semibold">Omzet (Total Platform Fee)</th>
                        <th class="px-6 py-4 font-semibold text-brand-primary">PPh Final 0.5%</th>
                        <th class="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal text-sm">
                    @forelse($reports as $report)
                        <tr class="hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4 font-semibold text-txt-main">
                                {{ $report['period'] }}
                            </td>
                            <td class="px-6 py-4 text-txt-muted">
                                {{ number_format($report['total_transactions']) }} trx
                            </td>
                            <td class="px-6 py-4 font-medium text-txt-main">
                                Rp {{ number_format($report['total_platform_fee'], 0, ',', '.') }}
                            </td>
                            <td class="px-6 py-4 font-bold text-brand-primary">
                                Rp {{ number_format($report['tax_amount'], 0, ',', '.') }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button wire:click="exportCsv({{ $report['year'] }}, {{ $report['month'] }})" class="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                    Export CSV (Rincian)
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-txt-muted">
                                <div class="flex flex-col items-center justify-center">
                                    <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    <p>Belum ada data transaksi yang lunas (PAID) untuk dilaporkan.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
