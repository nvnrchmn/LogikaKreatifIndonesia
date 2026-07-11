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
    public function with(): array
    {
        return [
            'comments' => OrderComment::with('user')
                ->where('order_id', $this->order_id)
                ->orderBy('created_at', 'asc')
                ->get()
        ];
    }
};
?>

<div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[500px]">
    <div class="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            Diskusi Proyek
        </h3>
    </div>
    
    <div class="p-6 flex-1 overflow-y-auto space-y-5 bg-gray-50/50" id="chat-container">
        @forelse($comments as $comment)
            <div class="flex {{ $comment->user_id === auth()->id() ? 'justify-end' : 'justify-start' }}">
                <div class="max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm {{ $comment->user_id === auth()->id() ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm' }}">
                    <div class="text-[11px] {{ $comment->user_id === auth()->id() ? 'text-white/70' : 'text-gray-400' }} mb-1 font-semibold tracking-wide uppercase">
                        {{ $comment->user->name }} &bull; {{ $comment->created_at->format('d M H:i') }}
                    </div>
                    <div class="text-sm leading-relaxed">
                        {!! nl2br(e($comment->body)) !!}
                    </div>
                </div>
            </div>
        @empty
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <p class="font-medium text-gray-600">Belum ada diskusi di proyek ini.</p>
                <p class="text-xs mt-1">Kirim pesan pertama untuk memulai percakapan!</p>
            </div>
        @endforelse
    </div>

    <div class="p-4 sm:p-5 bg-white border-t border-gray-100 shrink-0">
        <form wire:submit="submitComment">
            <div class="flex items-end gap-3 relative">
                <div class="flex-1">
                    <textarea wire:model="body" rows="2" class="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:bg-white focus:border-brand-primary focus:ring-brand-primary text-sm resize-none p-3.5 transition-colors placeholder-gray-400" placeholder="Ketik pesan Anda di sini..." required></textarea>
                </div>
                <button type="submit" class="bg-brand-primary text-white w-12 h-12 rounded-xl hover:bg-brand-primary-hover hover:shadow-md transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" wire:loading.attr="disabled">
                    <svg wire:loading.remove wire:target="submitComment" class="w-5 h-5 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    <svg wire:loading wire:target="submitComment" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            @error('body') <div class="text-red-500 text-xs mt-2 font-medium">{{ $message }}</div> @enderror
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