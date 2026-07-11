<?php

namespace App\Livewire\Client\Orders;

use Livewire\Component;
use Livewire\WithPagination;
use Livewire\Attributes\Layout;
use App\Models\Order;

#[Layout('components.layouts.client')]
class Index extends Component
{
    use WithPagination;

    public $search = '';
    public $status = '';

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function updatingStatus()
    {
        $this->resetPage();
    }

    public function render()
    {
        $user = auth()->user();
        
        $query = Order::where('user_id', $user->id)
                      ->with('service', 'transactions')
                      ->latest();

        if ($this->search) {
            $query->where(function($q) {
                $q->where('order_number', 'like', '%' . $this->search . '%')
                  ->orWhere('project_name', 'like', '%' . $this->search . '%');
            });
        }

        if ($this->status) {
            $query->where('status', $this->status);
        }

        $orders = $query->paginate(10);

        return view('livewire.client.orders.index', compact('orders'))
               ->title('My Orders');
    }
}
