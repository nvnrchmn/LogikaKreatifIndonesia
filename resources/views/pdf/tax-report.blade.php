<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Pajak Logikraf - {{ $monthName }} {{ $year }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h2 {
            margin: 0;
            padding: 0;
            color: #111827;
        }
        .header p {
            margin: 5px 0 0;
            color: #6B7280;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f9fafb;
            font-weight: bold;
        }
        .summary-box {
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9fafb;
            width: 300px;
            float: right;
            margin-top: 20px;
        }
        .summary-box p {
            margin: 5px 0;
            font-size: 14px;
        }
        .text-right {
            text-align: right;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan Pendapatan & Pajak Logikraf</h2>
        <p>Periode: {{ $monthName }} {{ $year }}</p>
    </div>

    <h4>1. Omzet Jasa IT Internal</h4>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Referensi</th>
                <th>Klien</th>
                <th class="text-right">Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalInternal = 0; @endphp
            @forelse($internalTransactions as $t)
                @php $totalInternal += $t->amount; @endphp
                <tr>
                    <td>{{ $t->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $t->transaction_reference }}</td>
                    <td>{{ $t->order->user->company_name ?? $t->order->user->name }}</td>
                    <td class="text-right">{{ number_format($t->amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center">Tidak ada transaksi internal bulan ini.</td>
                </tr>
            @endforelse
            <tr>
                <th colspan="3" class="text-right">Subtotal Omzet Internal</th>
                <th class="text-right">{{ number_format($totalInternal, 0, ',', '.') }}</th>
            </tr>
        </tbody>
    </table>

    <h4>2. Omzet Aplikasi (Payment Hub Platform Fee)</h4>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>ID Transaksi</th>
                <th>Aplikasi SaaS</th>
                <th class="text-right">Platform Fee (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalPh = 0; @endphp
            @forelse($phTransactions as $t)
                @php $totalPh += $t->platform_fee_amount; @endphp
                <tr>
                    <td>{{ $t->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $t->external_id }}</td>
                    <td>{{ $t->saasApplication ? $t->saasApplication->name : '-' }}</td>
                    <td class="text-right">{{ number_format($t->platform_fee_amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center">Tidak ada transaksi Payment Hub bulan ini.</td>
                </tr>
            @endforelse
            <tr>
                <th colspan="3" class="text-right">Subtotal Omzet Payment Hub</th>
                <th class="text-right">{{ number_format($totalPh, 0, ',', '.') }}</th>
            </tr>
        </tbody>
    </table>

    <div class="summary-box">
        @php 
            $grandTotal = $totalInternal + $totalPh;
            $tax = $grandTotal * 0.005;
        @endphp
        <p><strong>Total Omzet Keseluruhan:</strong> <span style="float: right">Rp {{ number_format($grandTotal, 0, ',', '.') }}</span></p>
        <p><strong>Tarif PPh Final (PP 55/2022):</strong> <span style="float: right">0.5%</span></p>
        <hr style="border-top: 1px dashed #ccc; margin: 10px 0;">
        <p style="color: #dc2626;"><strong>Pajak Terutang:</strong> <span style="float: right">Rp {{ number_format($tax, 0, ',', '.') }}</span></p>
    </div>
    <div class="clear"></div>

    <div style="margin-top: 50px; font-size: 10px; color: #9ca3af; text-align: center;">
        Dokumen ini dibuat secara otomatis oleh Sistem Logikraf pada {{ now()->format('d/m/Y H:i') }}.
    </div>

</body>
</html>
