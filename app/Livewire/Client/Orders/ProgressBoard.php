<?php

namespace App\Livewire\Client\Orders;

use App\Models\Order;
use App\Models\OrderTask;
use Livewire\Component;

class ProgressBoard extends Component
{
    public Order $order;

    public function mount(Order $order)
    {
        $this->order = $order;
    }

    public function render()
    {
        $tasks = OrderTask::where('order_id', $this->order->id)
            ->orderBy('position')
            ->get();

        return view('livewire.client.orders.progress-board', compact('tasks'));
    }
}
