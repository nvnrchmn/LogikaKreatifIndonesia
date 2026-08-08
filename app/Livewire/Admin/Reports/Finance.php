<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Reports;

use App\Models\Invoice;
use Livewire\Component;
use Illuminate\Support\Carbon;

class Finance extends Component
{
    public function render()
    {
        $invoices = Invoice::where('type', 'invoice')->get();

        $totalAll = $invoices->sum('total');
        $paid = $invoices->where('status', 'paid')->sum('total');
        $cancelled = $invoices->where('status', 'cancelled')->sum('total');
        $unpaid = $invoices->whereNotIn('status', ['paid', 'cancelled'])->sum('total');

        // Revenue per bulan (6 bulan terakhir) dari invoice paid
        $monthly = collect(range(5, 0))->map(function ($i) {
            $date = Carbon::now()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $revenue = Invoice::where('type', 'invoice')
                ->where('status', 'paid')
                ->whereBetween('issue_date', [$start, $end])
                ->sum('total');

            return [
                'label' => $date->format('M Y'),
                'revenue' => (int) $revenue,
            ];
        });

        $recent = Invoice::where('type', 'invoice')
            ->latest('issue_date')
            ->take(10)
            ->get();

        return view('livewire.admin.reports.finance', compact(
            'totalAll', 'paid', 'unpaid', 'cancelled', 'monthly', 'recent'
        ))->layout('components.layouts.admin');
    }
}
