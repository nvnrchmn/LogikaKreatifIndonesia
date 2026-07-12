<?php

namespace App\Livewire\Admin\PaymentHub;

use Livewire\Component;
use Livewire\Attributes\Layout;
use App\Models\PaymentHub\PhTransaction;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

#[Layout('components.layouts.admin', ['title' => 'Laporan Pajak'])]
class TaxReports extends Component
{
    public function getMonthlyReportsProperty()
    {
        // Get paid Payment Hub transactions
        $phReports = PhTransaction::where('status', 'PAID')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total_ph_transactions'),
                DB::raw('SUM(platform_fee_amount) as total_ph_fee')
            )
            ->groupBy('year', 'month')
            ->get();

        // Get paid Internal Orders
        $internalReports = Transaction::where('status', 'settlement')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total_internal_transactions'),
                DB::raw('SUM(amount) as total_internal_amount')
            )
            ->groupBy('year', 'month')
            ->get();

        $combined = [];

        foreach ($phReports as $report) {
            $key = $report->year . '-' . $report->month;
            $combined[$key] = [
                'year' => $report->year,
                'month' => $report->month,
                'period' => $this->getMonthName($report->month) . ' ' . $report->year,
                'ph_omzet' => (int) $report->total_ph_fee,
                'internal_omzet' => 0,
                'total_omzet' => (int) $report->total_ph_fee,
            ];
        }

        foreach ($internalReports as $report) {
            $key = $report->year . '-' . $report->month;
            if (!isset($combined[$key])) {
                $combined[$key] = [
                    'year' => $report->year,
                    'month' => $report->month,
                    'period' => $this->getMonthName($report->month) . ' ' . $report->year,
                    'ph_omzet' => 0,
                    'internal_omzet' => (int) $report->total_internal_amount,
                    'total_omzet' => (int) $report->total_internal_amount,
                ];
            } else {
                $combined[$key]['internal_omzet'] = (int) $report->total_internal_amount;
                $combined[$key]['total_omzet'] += (int) $report->total_internal_amount;
            }
        }
        
        // Sort keys descending
        krsort($combined);

        $result = [];
        foreach ($combined as $key => $data) {
            $data['tax_amount'] = $data['total_omzet'] * 0.005; // 0.5% PPh Final
            $result[] = $data;
        }

        return $result;
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
        $phTransactions = PhTransaction::where('status', 'PAID')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->with(['saasApplication', 'phSubAccount'])
            ->orderBy('created_at', 'asc')
            ->get();

        $internalTransactions = Transaction::where('status', 'settlement')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->with(['order', 'order.client'])
            ->orderBy('created_at', 'asc')
            ->get();

        $fileName = "laporan_pajak_gabungan_{$year}_{$month}.csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Tipe Transaksi',
            'Tanggal Transaksi', 
            'ID/Referensi', 
            'Klien/Sumber', 
            'Nominal Diterima Logikraf (Omzet)', 
            'Tarif Pajak (PPh Final 0.5%)', 
            'Nominal Pajak (Rp)'
        ];

        $callback = function() use($phTransactions, $internalTransactions, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            // Export Internal Transactions
            foreach ($internalTransactions as $t) {
                $taxNominal = $t->amount * 0.005;
                fputcsv($file, [
                    'Jasa IT Internal',
                    $t->created_at->format('Y-m-d H:i:s'),
                    $t->transaction_reference,
                    $t->order->client->company_name ?? $t->order->client->name,
                    $t->amount,
                    '0.5%',
                    $taxNominal
                ]);
            }

            // Export Payment Hub Transactions
            foreach ($phTransactions as $t) {
                $taxNominal = $t->platform_fee_amount * 0.005;
                fputcsv($file, [
                    'SaaS Platform Fee',
                    $t->created_at->format('Y-m-d H:i:s'),
                    $t->external_id,
                    $t->saasApplication ? $t->saasApplication->name : '-',
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
