<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $invoice->type === 'quotation' ? 'Quotation' : 'Invoice' }} {{ $invoice->number }}</title>
    <style>
        @page { margin: 2cm; }
        * { box-sizing: border-box; }
        body { font-family: 'Helvetica', Arial, sans-serif; color: #1f2937; font-size: 13px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #6d28d9; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { font-size: 22px; font-weight: bold; color: #6d28d9; }
        .brand-sub { font-size: 11px; color: #6b7280; }
        .company-meta { font-size: 11px; color: #4b5563; text-align: right; }
        .doc-title { font-size: 26px; font-weight: bold; color: #111827; margin: 0 0 4px; }
        .doc-meta { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .doc-meta td { padding: 4px 0; vertical-align: top; }
        .doc-meta .label { color: #6b7280; width: 90px; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #6d28d9; margin: 0 0 6px; }
        .to-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; margin-bottom: 24px; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        table.items th { background: #6d28d9; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; }
        table.items td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
        table.items .num { text-align: right; }
        .totals { width: 320px; margin-left: auto; border-collapse: collapse; }
        .totals td { padding: 6px 10px; }
        .totals .label { color: #6b7280; }
        .totals .grand { font-size: 16px; font-weight: bold; color: #6d28d9; border-top: 2px solid #6d28d9; }
        .notes { margin-top: 24px; font-size: 11px; color: #6b7280; }
        .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 10px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">{{ $company['name'] }}</div>
            <div class="brand-sub">Software House & IT Solutions</div>
        </div>
        <div class="company-meta">
            {{ $company['address'] }}<br>
            Telp: {{ $company['phone'] }}<br>
            Email: {{ $company['email'] }}<br>
            NPWP: {{ $company['npwp'] }}
        </div>
    </div>

    <h1 class="doc-title">{{ $invoice->type === 'quotation' ? 'QUOTATION' : 'INVOICE' }}</h1>
    <table class="doc-meta">
        <tr>
            <td class="label">No.</td>
            <td><strong>{{ $invoice->number }}</strong></td>
            <td class="label" style="text-align:right;">Tanggal</td>
            <td>{{ $invoice->issue_date?->format('d M Y') ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Status</td>
            <td><strong>{{ ucfirst($invoice->status) }}</strong></td>
            <td class="label" style="text-align:right;">Jatuh Tempo</td>
            <td>{{ $invoice->due_date?->format('d M Y') ?? '-' }}</td>
        </tr>
    </table>

    <p class="section-title">Kepada</p>
    <div class="to-box">
        <strong>{{ $invoice->client_name }}</strong><br>
        @if($invoice->client_company)<span>{{ $invoice->client_company }}</span><br>@endif
        @if($invoice->client_email)<span>{{ $invoice->client_email }}</span><br>@endif
        @if($invoice->subject)<span>Perihal: {{ $invoice->subject }}</span>@endif
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="width:5%;">#</th>
                <th style="width:55%;">Deskripsi</th>
                <th class="num" style="width:12%;">Qty</th>
                <th class="num" style="width:14%;">Harga</th>
                <th class="num" style="width:14%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($invoice->items ?? [] as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $item['description'] ?? '-' }}</td>
                    <td class="num">{{ $item['quantity'] ?? 1 }}</td>
                    <td class="num">Rp {{ number_format($item['price'] ?? 0, 0, ',', '.') }}</td>
                    <td class="num">Rp {{ number_format(($item['quantity'] ?? 1) * ($item['price'] ?? 0), 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" style="text-align:center;color:#9ca3af;">Tidak ada item</td></tr>
            @endforelse
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="label">Subtotal</td>
            <td class="num">Rp {{ number_format($invoice->subtotal, 0, ',', '.') }}</td>
        </tr>
        @if($invoice->discount_amount > 0)
        <tr>
            <td class="label">Diskon</td>
            <td class="num">- Rp {{ number_format($invoice->discount_amount, 0, ',', '.') }}</td>
        </tr>
        @endif
        @if($invoice->tax_amount > 0)
        <tr>
            <td class="label">Pajak</td>
            <td class="num">Rp {{ number_format($invoice->tax_amount, 0, ',', '.') }}</td>
        </tr>
        @endif
        <tr class="grand">
            <td class="label">Total</td>
            <td class="num">Rp {{ number_format($invoice->total, 0, ',', '.') }}</td>
        </tr>
    </table>

    @if($invoice->notes)
    <div class="notes">
        <p class="section-title">Catatan</p>
        {!! nl2br(e($invoice->notes)) !!}
    </div>
    @endif

    <div class="notes">
        <p class="section-title">Informasi Pembayaran</p>
        Bank: {{ $company['bank_name'] }}<br>
        No. Rek: {{ $company['bank_account'] }} a.n {{ $company['bank_holder'] }}
    </div>

    <div class="footer">
        Dokumen ini dihasilkan secara otomatis oleh sistem Logikraf.id &mdash; {{ $company['name'] }}
    </div>
</body>
</html>
