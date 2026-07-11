<?php

use Livewire\Component;
use App\Models\OrderComment;
use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\On;

new class extends Component
{
    public $order_id;
    public $body = '';

    public function mount($order_id)
    {
        $this->order_id = $order_id;
    }

    public function submitComment()
    {
        $this->validate([
            'body' => 'required|string|max:1000',
        ]);

        OrderComment::create([
            'order_id' => $this->order_id,
            'user_id' => Auth::id(),
            'body' => $this->body,
        ]);

        $this->body = '';
        $this->dispatch('comment-added');
    }

    #[On('comment-added')]
    public function render()
    {
        $comments = OrderComment::with('user')
            ->where('order_id', $this->order_id)
            ->orderBy('created_at', 'asc')
            ->get();
            
        return view('livewire.shared.project-thread', compact('comments'));
    }
};
?>

<div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">Diskusi Proyek</h3>
    </div>
    
    <div class="p-6 h-96 overflow-y-auto space-y-4 bg-gray-50" id="chat-container">
        @forelse($comments as $comment)
            <div class="flex {{ $comment->user_id === auth()->id() ? 'justify-end' : 'justify-start' }}">
                <div class="max-w-[75%] rounded-2xl px-5 py-3 {{ $comment->user_id === auth()->id() ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' }}">
                    <div class="text-xs {{ $comment->user_id === auth()->id() ? 'text-indigo-200' : 'text-gray-500' }} mb-1 font-medium">
                        {{ $comment->user->name }} &bull; {{ $comment->created_at->format('d M H:i') }}
                    </div>
                    <div class="text-sm">
                        {!! nl2br(e($comment->body)) !!}
                    </div>
                </div>
            </div>
        @empty
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <p>Belum ada diskusi di proyek ini.</p>
                <p class="text-xs text-gray-400 mt-1">Kirim pesan pertama untuk memulai!</p>
            </div>
        @endforelse
    </div>

    <div class="p-4 bg-white border-t border-gray-200">
        <form wire:submit="submitComment" class="flex gap-3">
            <textarea wire:model="body" rows="2" class="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm resize-none" placeholder="Tulis pesan..."></textarea>
            <button type="submit" class="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition font-medium self-end flex items-center gap-2">
                <span>Kirim</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
        </form>
    </div>

    @script
    <script>
        Livewire.hook('message.processed', (message, component) => {
            const container = document.getElementById('chat-container');
            if(container) {
                container.scrollTop = container.scrollHeight;
            }
        });
        
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('chat-container');
            if(container) {
                container.scrollTop = container.scrollHeight;
            }
        });
    </script>
    @endscript
</div>