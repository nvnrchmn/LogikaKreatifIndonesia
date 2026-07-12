<?php

namespace App\Livewire\Admin\Tickets;

use App\Models\Ticket;
use App\Models\TicketReply;
use Livewire\Component;
use Livewire\Attributes\Layout;

#[Layout('components.layouts.admin')]
class Show extends Component
{
    public Ticket $ticket;
    public $message = '';

    public function mount(Ticket $ticket)
    {
        $this->ticket = $ticket->load(['user', 'order', 'replies.user']);
    }

    public function reply()
    {
        $this->validate([
            'message' => 'required|min:3'
        ]);

        TicketReply::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => auth()->id(),
            'message' => $this->message,
        ]);

        if ($this->ticket->status === 'open') {
            $this->ticket->update(['status' => 'in_progress']);
        }

        $this->message = '';
        $this->ticket->load('replies.user');
        
        session()->flash('success', 'Balasan berhasil dikirim.');
    }

    public function updateStatus($status)
    {
        if (in_array($status, ['open', 'in_progress', 'resolved', 'closed'])) {
            $this->ticket->update([
                'status' => $status,
                'resolved_at' => $status === 'resolved' ? now() : null,
            ]);
            session()->flash('success', 'Status tiket diperbarui.');
        }
    }

    public function render()
    {
        return view('livewire.admin.tickets.show')
            ->title('Detail Tiket - ' . $this->ticket->subject);
    }
}
