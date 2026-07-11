<?php

namespace App\Livewire\Client\Dashboard;

use Livewire\Component;
use Livewire\Attributes\Layout;
use App\Models\Order;

#[Layout('components.layouts.client')]
class Index extends Component
{
    public function render()
    {
        $user = auth()->user();
        
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'active_projects' => Order::where('user_id', $user->id)
                                      ->whereIn('status', ['pending', 'in_progress'])
                                      ->count(),
            'completed_projects' => Order::where('user_id', $user->id)
                                         ->where('status', 'completed')
                                         ->count(),
            'total_spent' => Order::where('user_id', $user->id)
                                  ->where('status', '!=', 'cancelled')
                                  ->sum('total_amount'),
        ];
        
        $recentOrders = Order::where('user_id', $user->id)
                             ->with('service')
                             ->latest()
                             ->take(3)
                             ->get();
                             
        return view('livewire.client.dashboard.index', compact('stats', 'recentOrders'))
               ->title('Client Dashboard');
    }
}
