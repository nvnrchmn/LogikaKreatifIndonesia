<div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Semua Tiket Bantuan</h2>
        
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select wire:model.live="status" class="form-input text-sm py-2">
                <option value="">Semua Status</option>
                <option value="open">Open (Baru)</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved (Selesai)</option>
                <option value="closed">Closed (Ditutup)</option>
            </select>
        </div>
    </div>

    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">Klien & Proyek</th>
                        <th class="px-6 py-4">Subjek Tiket</th>
                        <th class="px-6 py-4">Status & Prioritas</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($tickets as $ticket)
                        <tr class="hover:bg-canvas-light transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $ticket->user->name }}</div>
                                <div class="font-body text-xs text-brand-primary font-semibold mt-1">{{ $ticket->order->project_name ?? 'Tanpa Proyek' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $ticket->subject }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">{{ $ticket->created_at->format('d M Y H:i') }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col gap-2 items-start">
                                    @if($ticket->status === 'open')
                                        <span class="badge bg-status-danger/10 text-status-danger text-[10px]">Open</span>
                                    @elseif($ticket->status === 'in_progress')
                                        <span class="badge bg-brand-accent/10 text-brand-accent text-[10px]">In Progress</span>
                                    @elseif($ticket->status === 'resolved')
                                        <span class="badge bg-status-success/10 text-status-success text-[10px]">Resolved</span>
                                    @else
                                        <span class="badge bg-canvas-overlay text-txt-muted text-[10px]">Closed</span>
                                    @endif
                                    
                                    @if($ticket->priority === 'high')
                                        <span class="text-[10px] text-status-danger font-bold uppercase">High Priority</span>
                                    @elseif($ticket->priority === 'medium')
                                        <span class="text-[10px] text-status-warning font-bold uppercase">Medium Priority</span>
                                    @else
                                        <span class="text-[10px] text-txt-muted font-bold uppercase">Low Priority</span>
                                    @endif
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('admin.tickets.show', $ticket->id) }}" class="btn bg-white border border-border-minimal text-txt-main hover:bg-canvas-light px-3 py-1.5 text-xs">Lihat & Balas</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-6 py-8 text-center text-txt-muted text-sm">Tidak ada data tiket.</td>
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
</div>
