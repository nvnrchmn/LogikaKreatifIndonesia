<div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Tiket Bantuan Saya</h2>
        
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select wire:model.live="status" class="form-input text-sm py-2">
                <option value="">Semua Status</option>
                <option value="open">Menunggu Balasan (Open)</option>
                <option value="in_progress">Sedang Diproses</option>
                <option value="resolved">Selesai (Resolved)</option>
            </select>
            <button wire:click="$set('showCreateModal', true)" class="btn bg-brand-primary text-white hover:bg-brand-primary-hover px-4 py-2 text-sm">
                Buat Tiket Baru
            </button>
        </div>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif

    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">ID & Subjek</th>
                        <th class="px-6 py-4">Terkait Proyek</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($tickets as $ticket)
                        <tr class="hover:bg-canvas-light transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $ticket->subject }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">#TKT-{{ str_pad($ticket->id, 4, '0', STR_PAD_LEFT) }} &bull; {{ $ticket->created_at->format('d M Y') }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-medium text-txt-main">{{ $ticket->order->project_name ?? '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                @if($ticket->status === 'open')
                                    <span class="badge bg-status-danger/10 text-status-danger text-[10px]">Open</span>
                                @elseif($ticket->status === 'in_progress')
                                    <span class="badge bg-brand-accent/10 text-brand-accent text-[10px]">Diproses</span>
                                @elseif($ticket->status === 'resolved')
                                    <span class="badge bg-status-success/10 text-status-success text-[10px]">Selesai</span>
                                @else
                                    <span class="badge bg-canvas-overlay text-txt-muted text-[10px]">Ditutup</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('client.tickets.show', $ticket->id) }}" class="btn bg-white border border-border-minimal text-txt-main hover:bg-canvas-light px-3 py-1.5 text-xs">Lihat Detail</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-6 py-8 text-center text-txt-muted text-sm">Anda belum pernah membuat tiket bantuan.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($tickets->hasPages())
            <div class="px-6 py-4 border-t border-border-minimal">
                {{ $tickets->links() }}
            </div>
        @endif
    </div>

    <!-- Modal Create Ticket -->
    @if($showCreateModal)
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-txt-main/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-border-minimal flex justify-between items-center bg-canvas-overlay">
                <h3 class="font-display font-bold text-lg text-txt-main">Buat Tiket Bantuan Baru</h3>
                <button wire:click="$set('showCreateModal', false)" class="text-txt-muted hover:text-status-danger">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <form wire:submit="createTicket" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-bold text-txt-main mb-1.5">Pilih Proyek Terkait *</label>
                    <select wire:model="order_id" class="form-input w-full" required>
                        <option value="">-- Pilih Proyek --</option>
                        @foreach($this->orders as $order)
                            <option value="{{ $order->id }}">{{ $order->project_name }} (Order: {{ $order->order_number }})</option>
                        @endforeach
                    </select>
                    @error('order_id') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-txt-main mb-1.5">Subjek / Masalah *</label>
                    <input type="text" wire:model="subject" class="form-input w-full" placeholder="Cth: Laporan bug pada halaman checkout" required>
                    @error('subject') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-sm font-bold text-txt-main mb-1.5">Tingkat Prioritas</label>
                    <select wire:model="priority" class="form-input w-full">
                        <option value="low">Rendah (Pertanyaan Umum)</option>
                        <option value="medium">Sedang (Kendala Fitur)</option>
                        <option value="high">Tinggi (Sistem Down / Urgent)</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-txt-main mb-1.5">Detail Kendala *</label>
                    <textarea wire:model="description" rows="4" class="form-input w-full resize-none" placeholder="Jelaskan kendala Anda sedetail mungkin..." required></textarea>
                    @error('description') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>
                
                <div class="pt-4 flex justify-end gap-3">
                    <button type="button" wire:click="$set('showCreateModal', false)" class="btn bg-canvas-overlay text-txt-main hover:bg-canvas-light px-4 py-2">Batal</button>
                    <button type="submit" class="btn bg-brand-primary text-white hover:bg-brand-primary-hover px-6 py-2" wire:loading.attr="disabled">
                        <span wire:loading.remove wire:target="createTicket">Kirim Tiket</span>
                        <span wire:loading wire:target="createTicket">Mengirim...</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
    @endif
</div>
