<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Invoice & Quotation</h2>
        <a href="{{ route('admin.invoices.create') }}" class="btn-primary text-sm !py-2.5 !px-5">+ Buat Baru</a>
    </div>

    <div class="card overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 text-txt-muted">
                <tr>
                    <th class="text-left p-4 font-medium">No.</th>
                    <th class="text-left p-4 font-medium">Tipe</th>
                    <th class="text-left p-4 font-medium">Klien</th>
                    <th class="text-left p-4 font-medium">Subject</th>
                    <th class="text-left p-4 font-medium">Total</th>
                    <th class="text-left p-4 font-medium">Status</th>
                    <th class="text-right p-4 font-medium">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-minimal">
                @forelse ($invoices as $inv)
                    <tr>
                        <td class="p-4">{{ $inv->number }}</td>
                        <td class="p-4">
                            <span class="text-xs px-2 py-1 rounded-full {{ $inv->type === 'quotation' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700' }}">
                                {{ $inv->type === 'quotation' ? 'Quotation' : 'Invoice' }}
                            </span>
                        </td>
                        <td class="p-4">{{ $inv->client_name }}</td>
                        <td class="p-4">{{ Str::limit($inv->subject, 40) }}</td>
                        <td class="p-4 font-semibold">{{ $inv->formatted_total }}</td>
                        <td class="p-4">
                            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{{ $inv->status }}</span>
                        </td>
                        <td class="p-4 text-right">
                            <a href="{{ route('admin.invoices.edit', $inv) }}" class="text-brand-primary hover:underline">Edit</a>
                            <span class="text-gray-300 mx-1">|</span>
                            <a href="{{ route('admin.invoices.pdf', $inv) }}" class="text-brand-primary hover:underline" target="_blank">PDF</a>
                            @if ($inv->type === 'quotation')
                                <span class="text-gray-300 mx-1">|</span>
                                <a href="{{ route('admin.invoices.convert', $inv) }}" class="text-brand-primary hover:underline" onclick="return confirm('Konversi quotation ini menjadi invoice?')">Jadikan Invoice</a>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="p-8 text-center text-txt-muted">Belum ada invoice/quotation.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">
        {{ $invoices->links() }}
    </div>
</div>
