<?php

namespace App\Livewire\Client\Tickets;

use App\Models\Ticket;
use App\Models\TicketReply;
use Livewire\Component;
use Livewire\Attributes\Layout;

#[Layout('components.layouts.client')]
class Show extends Component
{
    public Ticket $ticket;
    public $message = '';

    public function mount(Ticket $ticket)
    {
        if ($ticket->user_id !== auth()->id()) {
            abort(403);
        }
        $this->ticket = $ticket->load(['order', 'replies.user']);
    }

    public function reply()
    {
        $this->validate([
            'message' => 'required|min:3'
        ]);

        if ($this->ticket->status === 'closed') {
            $this->addError('message', 'Tiket ini sudah ditutup, Anda tidak bisa membalas.');
            return;
        }

        TicketReply::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => auth()->id(),
            'message' => $this->message,
        ]);

        $this->message = '';
        $this->ticket->load('replies.user');
        
        session()->flash('success', 'Pesan berhasil dikirim.');
    }

    public function markAsResolved()
    {
        if ($this->ticket->status !== 'closed') {
            $this->ticket->update([
                'status' => 'resolved',
                'resolved_at' => now(),
            ]);
            session()->flash('success', 'Terima kasih, tiket telah ditandai sebagai selesai.');
        }
    }

    public function render()
    {
        return view('livewire.client.tickets.show')
            ->title('Detail Tiket - ' . $this->ticket->subject);
    }
}
