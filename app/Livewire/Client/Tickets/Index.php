<?php

namespace App\Livewire\Client\Tickets;

use App\Models\Ticket;
use App\Models\Order;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\Attributes\Layout;

#[Layout('components.layouts.client')]
class Index extends Component
{
    use WithPagination;

    public $status = '';
    public $showCreateModal = false;
    
    // Form fields
    public $order_id = '';
    public $subject = '';
    public $description = '';
    public $priority = 'medium';

    public function updatingStatus()
    {
        $this->resetPage();
    }

    public function getOrdersProperty()
    {
        return Order::where('user_id', auth()->id())->latest()->get();
    }

    public function createTicket()
    {
        $this->validate([
            'order_id' => 'required|exists:orders,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'priority' => 'required|in:low,medium,high',
        ]);

        // Ensure the order belongs to the user
        $order = Order::where('id', $this->order_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $ticket = Ticket::create([
            'user_id' => auth()->id(),
            'order_id' => $order->id,
            'subject' => $this->subject,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => 'open',
        ]);

        $this->reset(['order_id', 'subject', 'description', 'priority', 'showCreateModal']);
        session()->flash('success', 'Tiket bantuan berhasil dibuat. Tim kami akan segera merespons.');
        
        return redirect()->route('client.tickets.show', $ticket->id);
    }

    public function render()
    {
        $query = Ticket::where('user_id', auth()->id())->with('order')->latest();

        if ($this->status) {
            $query->where('status', $this->status);
        }

        $tickets = $query->paginate(10);

        return view('livewire.client.tickets.index', compact('tickets'))
            ->title('Tiket Bantuan');
    }
}
