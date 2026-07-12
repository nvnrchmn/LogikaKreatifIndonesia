<?php

namespace App\Livewire\Admin\PaymentHub;

use Livewire\Component;
use Livewire\Attributes\Layout;
use App\Models\PaymentHub\PhTransaction;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

#[Layout('components.layouts.admin', ['title' => 'Laporan Pajak'])]
class TaxReports extends Component
{
    public function getMonthlyReportsProperty()
    {
        // Get paid transactions grouped by month and year
        $reports = PhTransaction::where('status', 'PAID')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(platform_fee_amount) as total_platform_fee')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return $reports->map(function ($report) {
            $taxAmount = $report->total_platform_fee * 0.005; // 0.5% PPh Final
            return [
                'period' => $this->getMonthName($report->month) . ' ' . $report->year,
                'year' => $report->year,
                'month' => $report->month,
                'total_transactions' => $report->total_transactions,
                'total_platform_fee' => $report->total_platform_fee,
                'tax_amount' => $taxAmount,
            ];
        });
    }

    private function getMonthName($monthNum)
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        return $months[$monthNum] ?? '';
    }

    public function exportCsv($year, $month)
    {
        $transactions = PhTransaction::where('status', 'PAID')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->with(['saasApplication', 'phSubAccount'])
            ->orderBy('created_at', 'asc')
            ->get();

        $fileName = "laporan_pajak_{$year}_{$month}.csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Tanggal Transaksi', 
            'ID Tagihan Logikraf', 
            'ID Tagihan External', 
            'SaaS App', 
            'Sub-Account (RT)', 
            'Total Dibayar Warga (Rp)', 
            'Platform Fee (Omzet Logikraf)', 
            'Tarif Pajak (PPh Final 0.5%)', 
            'Nominal Pajak (Rp)'
        ];

        $callback = function() use($transactions, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($transactions as $t) {
                $taxNominal = $t->platform_fee_amount * 0.005;
                fputcsv($file, [
                    $t->created_at->format('Y-m-d H:i:s'),
                    $t->id,
                    $t->external_id,
                    $t->saasApplication ? $t->saasApplication->name : '-',
                    $t->phSubAccount ? $t->phSubAccount->business_name : '-',
                    $t->amount,
                    $t->platform_fee_amount,
                    '0.5%',
                    $taxNominal
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function render()
    {
        return view('components.admin.payment-hub.tax-reports', [
            'reports' => $this->monthlyReports
        ]);
    }
}
