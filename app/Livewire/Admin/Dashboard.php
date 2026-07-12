<?php

declare(strict_types=1);

namespace App\Livewire\Admin;

use App\Models\Lead;
use App\Models\Order;
use App\Models\Portfolio;
use App\Models\Service;
use App\Models\Transaction;
use Livewire\Component;

class Dashboard extends Component
{
    public function render()
    {
        $internalRevenue = Transaction::where('status', 'settlement')->sum('amount');
        $phRevenue = \App\Models\PaymentHub\PhTransaction::where('status', 'PAID')->sum('platform_fee_amount');

        $stats = [
            'total_leads' => Lead::count(),
            'new_leads' => Lead::where('status', 'new')->count(),
            'total_orders' => Order::count(),
            'active_orders' => Order::where('status', 'in_progress')->count(),
            'total_revenue' => $internalRevenue + $phRevenue,
            'internal_revenue' => $internalRevenue,
            'ph_revenue' => $phRevenue,
            'pending_payments' => Transaction::where('status', 'pending')->count(),
            'total_portfolios' => Portfolio::count(),
            'total_services' => Service::where('is_active', true)->count(),
        ];

        $recentLeads = Lead::latest()->take(5)->get();
        $recentOrders = Order::with('user', 'service')->latest()->take(5)->get();

        return view('livewire.admin.dashboard', compact('stats', 'recentLeads', 'recentOrders'))
            ->layout('components.layouts.admin', ['title' => 'Dashboard']);
    }
}
