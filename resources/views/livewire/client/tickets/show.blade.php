<div>
    <div class="mb-6 flex items-center justify-between">
        <div>
            <h2 class="font-display text-xl font-bold text-txt-main">{{ $ticket->subject }}</h2>
            <p class="text-sm text-txt-muted mt-1">Dibuat pada {{ $ticket->created_at->format('d M Y H:i') }} | Terkait Order: <a href="{{ route('client.orders.show', $ticket->order_id) }}" class="text-brand-primary hover:underline">{{ $ticket->order->order_number }}</a></p>
        </div>
        <a href="{{ route('client.tickets.index') }}" class="btn bg-white border border-border-minimal text-txt-main hover:bg-canvas-light px-4 py-2 text-sm">Kembali</a>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Kolom Kiri: Chat / Replies -->
        <div class="lg:col-span-2 space-y-6">
            <div class="card p-6 flex flex-col h-[600px]">
                <div class="flex-1 overflow-y-auto space-y-5 pr-2">
                    <!-- Original Message -->
                    <div class="flex justify-end">
                        <div class="max-w-[85%] rounded-2xl px-5 py-3 shadow-sm bg-brand-primary text-white rounded-br-sm">
                            <div class="text-[11px] text-white/70 mb-1 font-semibold tracking-wide uppercase">
                                Anda &bull; {{ $ticket->created_at->format('d M H:i') }}
                            </div>
                            <div class="text-sm leading-relaxed">
                                {!! nl2br(e($ticket->description)) !!}
                            </div>
                        </div>
                    </div>

                    <!-- Replies -->
                    @foreach($ticket->replies as $reply)
                        <div class="flex {{ $reply->user_id === auth()->id() ? 'justify-end' : 'justify-start' }}">
                            <div class="max-w-[85%] rounded-2xl px-5 py-3 shadow-sm {{ $reply->user_id === auth()->id() ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-canvas-light border border-border-minimal text-txt-main rounded-bl-sm' }}">
                                <div class="text-[11px] {{ $reply->user_id === auth()->id() ? 'text-white/70' : 'text-brand-primary' }} mb-1 font-semibold tracking-wide uppercase">
                                    {{ $reply->user_id === auth()->id() ? 'Anda' : 'Tim Support' }} &bull; {{ $reply->created_at->format('d M H:i') }}
                                </div>
                                <div class="text-sm leading-relaxed">
                                    {!! nl2br(e($reply->message)) !!}
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>

                @if($ticket->status !== 'closed')
                    <div class="mt-6 pt-4 border-t border-border-minimal shrink-0">
                        <form wire:submit="reply">
                            <div class="flex items-end gap-3 relative">
                                <div class="flex-1">
                                    <textarea wire:model="message" rows="2" class="block w-full rounded-xl border-border-minimal bg-canvas-light shadow-sm focus:bg-white focus:border-brand-primary focus:ring-brand-primary text-sm resize-none p-3.5 transition-colors placeholder-txt-muted" placeholder="Ketik balasan Anda di sini..." required></textarea>
                                </div>
                                <button type="submit" class="bg-brand-primary text-white w-12 h-12 rounded-xl hover:bg-brand-primary-hover transition-all flex items-center justify-center shrink-0 disabled:opacity-50" wire:loading.attr="disabled">
                                    <svg wire:loading.remove wire:target="reply" class="w-5 h-5 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                                    <svg wire:loading wire:target="reply" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                </button>
                            </div>
                            @error('message') <div class="text-status-danger text-xs mt-2">{{ $message }}</div> @enderror
                        </form>
                    </div>
                @else
                    <div class="mt-6 pt-4 border-t border-border-minimal text-center text-sm text-txt-muted">
                        Tiket ini telah ditutup oleh Admin.
                    </div>
                @endif
            </div>
        </div>

        <!-- Kolom Kanan: Status & Info -->
        <div class="lg:col-span-1 space-y-6">
            <div class="card p-6">
                <h3 class="font-display font-semibold text-lg text-txt-main mb-4">Informasi Tiket</h3>
                <dl class="space-y-4 text-sm">
                    <div>
                        <dt class="text-txt-muted mb-1 text-xs uppercase tracking-wider">Status Saat Ini</dt>
                        <dd>
                            @if($ticket->status === 'open')
                                <span class="badge bg-status-danger/10 text-status-danger text-[10px]">Menunggu Balasan</span>
                            @elseif($ticket->status === 'in_progress')
                                <span class="badge bg-brand-accent/10 text-brand-accent text-[10px]">Sedang Diproses</span>
                            @elseif($ticket->status === 'resolved')
                                <span class="badge bg-status-success/10 text-status-success text-[10px]">Selesai (Resolved)</span>
                            @else
                                <span class="badge bg-canvas-overlay text-txt-muted text-[10px]">Ditutup</span>
                            @endif
                        </dd>
                    </div>
                    <div>
                        <dt class="text-txt-muted mb-1 text-xs uppercase tracking-wider">Prioritas</dt>
                        <dd class="font-medium text-txt-main uppercase text-xs">
                            @if($ticket->priority === 'high') <span class="text-status-danger font-bold">Tinggi</span>
                            @elseif($ticket->priority === 'medium') <span class="text-status-warning font-bold">Sedang</span>
                            @else <span>Rendah</span> @endif
                        </dd>
                    </div>
                </dl>
                
                @if($ticket->status !== 'closed' && $ticket->status !== 'resolved')
                    <div class="mt-6 pt-6 border-t border-border-minimal">
                        <p class="text-xs text-txt-muted mb-3 leading-relaxed">Apakah kendala Anda sudah teratasi? Anda dapat menutup tiket ini.</p>
                        <button wire:click="markAsResolved" wire:confirm="Tandai tiket ini sebagai Selesai?" class="w-full btn bg-status-success text-white hover:opacity-90 px-4 py-2 text-sm">
                            Tandai Sudah Selesai
                        </button>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
