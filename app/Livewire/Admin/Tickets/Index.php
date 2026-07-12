<?php

namespace App\Livewire\Admin\Tickets;

use App\Models\Ticket;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\Attributes\Layout;

#[Layout('components.layouts.admin')]
class Index extends Component
{
    use WithPagination;

    public $status = '';

    public function updatingStatus()
    {
        $this->resetPage();
    }

    public function render()
    {
        $query = Ticket::with(['user', 'order'])->latest();

        if ($this->status) {
            $query->where('status', $this->status);
        }

        $tickets = $query->paginate(15);

        return view('livewire.admin.tickets.index', compact('tickets'))
            ->title('Manajemen Tiket Bantuan');
    }
}
