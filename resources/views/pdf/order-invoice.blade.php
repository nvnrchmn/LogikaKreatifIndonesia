<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - {{ $order->order_number }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; font-size: 14px; color: #333; }
        .header { width: 100%; border-bottom: 2px solid #0052FF; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-img { height: 110px; margin-top: -40px; margin-bottom: -40px; margin-left: -15px; }
        .invoice-title { font-size: 20px; color: #555; text-transform: uppercase; float: right; margin-top: 5px; font-weight: 700; }
        .details-table { width: 100%; margin-bottom: 30px; }
        .details-table td { vertical-align: top; width: 50%; }
        .info-label { font-size: 11px; color: #777; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; font-weight: 600; }
        .info-value { font-weight: 700; font-size: 16px; margin-bottom: 15px; }
        .milestone-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .milestone-table th { background: #f4f5f7; color: #555; font-size: 12px; text-transform: uppercase; padding: 10px; text-align: left; border-bottom: 1px solid #ddd; font-weight: 600; }
        .milestone-table td { padding: 15px 10px; border-bottom: 1px solid #eee; }
        .status-badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-unpaid { background: #fef08a; color: #854d0e; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .total-section { float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; border-top: 2px solid #333; font-weight: bold; }
        .total-label { float: left; }
        .total-amount { float: right; color: #0052FF; }
        .footer { position: fixed; bottom: -20px; left: 0; right: 0; height: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
</head>
<body>
    @php
        $logoPath = public_path('images/logo-transparant.png');
        $logoSrc = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : '';
    @endphp

    <div class="header clearfix">
        @if($logoSrc)
            <img src="{{ $logoSrc }}" class="logo-img" alt="Logikraf">
        @else
            <span style="font-size: 24px; font-weight: bold; color: #0052FF;">LOGIKRAF</span>
        @endif
        <span class="invoice-title">DETAIL PROYEK & TAGIHAN</span>
    </div>

    <table class="details-table">
        <tr>
            <td>
                <span class="info-label">DITAGIHKAN KEPADA</span>
                <div class="info-value">{{ $order->user->name }}</div>
                <div style="font-size: 13px; color: #555; margin-bottom: 5px;">{{ $order->user->email }}</div>
            </td>
            <td style="text-align: right;">
                <span class="info-label">NOMOR ORDER</span>
                <div class="info-value">{{ $order->order_number }}</div>
                
                <span class="info-label">NAMA PROYEK</span>
                <div class="info-value" style="font-size: 14px;">{{ $order->project_name }}</div>
                
                <span class="info-label">LAYANAN</span>
                <div class="info-value" style="font-size: 14px;">{{ $order->service->name ?? '-' }}</div>
            </td>
        </tr>
    </table>

    <table class="milestone-table">
        <thead>
            <tr>
                <th>Deskripsi Milestone</th>
                <th>Referensi Tagihan</th>
                <th>Status</th>
                <th style="text-align: right;">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->transactions as $trx)
            <tr>
                <td>
                    <strong>{{ $trx->milestone_name }}</strong>
                    @if($trx->status === 'settlement' && $trx->settled_at)
                        <div style="font-size: 11px; color: #777; margin-top: 5px;">Dibayar pada: {{ $trx->settled_at->format('d M Y, H:i') }}</div>
                    @endif
                </td>
                <td style="font-size: 12px; color: #555;">{{ $trx->transaction_reference }}</td>
                <td>
                    @if($trx->status === 'settlement')
                        <span class="status-badge status-paid">Lunas</span>
                    @elseif($trx->status === 'cancelled')
                        <span class="status-badge status-cancelled">Dibatalkan</span>
                    @else
                        <span class="status-badge status-unpaid">Belum Dibayar</span>
                    @endif
                </td>
                <td style="text-align: right; font-weight: bold;">Rp {{ number_format($trx->amount, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="clearfix">
        <div class="total-section">
            <div class="total-row">
                <span class="total-label">Total Proyek:</span>
                <span class="total-amount">{{ $order->formatted_amount }}</span>
            </div>
        </div>
    </div>

    <div class="footer">
        Dicetak pada: {{ now()->format('d M Y, H:i') }} | PT. Logika Kreatif Indonesia
    </div>
</body>
</html>
