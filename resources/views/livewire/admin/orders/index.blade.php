<div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Daftar Order Proyek</h2>
        
        <!-- Filters & Action -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input wire:model.live="search" type="text" class="form-input text-sm py-2" placeholder="Cari order, klien...">
            <select wire:model.live="statusFilter" class="form-input text-sm py-2">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <button wire:click="create" class="btn-primary text-sm py-2 whitespace-nowrap">
                + Buat Order Baru
            </button>
        </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">Nomor Order</th>
                        <th class="px-6 py-4">Proyek & Klien</th>
                        <th class="px-6 py-4">Nilai Proyek</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($orders as $order)
                        <tr class="hover:bg-canvas-light transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-semibold text-txt-main">{{ $order->order_number }}</div>
                                <div class="font-body text-xs text-txt-muted">{{ $order->created_at->format('d M Y') }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-semibold text-brand-primary">{{ $order->project_name }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">{{ $order->user->name ?? '-' }} • {{ $order->service->name ?? '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $order->formatted_amount }}</div>
                            </td>
                            <td class="px-6 py-4 space-y-1">
                                <div>
                                    <span class="badge 
                                        @switch($order->status)
                                            @case('pending') bg-status-warning/10 text-status-warning @break
                                            @case('in_progress') bg-brand-primary/10 text-brand-primary @break
                                            @case('completed') bg-status-success/10 text-status-success @break
                                            @case('cancelled') bg-status-danger/10 text-status-danger @break
                                        @endswitch">
                                        {{ ucfirst(str_replace('_', ' ', $order->status)) }}
                                    </span>
                                </div>
                                <div>
                                    <span class="text-[10px] text-txt-muted font-medium">Milestone: {{ str_replace('_', ' ', $order->milestone_status) }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button type="button" wire:click="viewOrder({{ $order->id }})" class="text-brand-primary hover:underline text-sm font-medium">Detail & Tagihan</button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-txt-muted text-sm">Tidak ada data order.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($orders->hasPages())
            <div class="px-6 py-4 border-t border-border-minimal">
                {{ $orders->links() }}
            </div>
        @endif
    </div>

    <!-- Create Modal Form -->
    @if($isModalOpen)
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" x-data="{ open: true }" x-show="open">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden animate-scale-in" @click.outside="$wire.closeModal()">
                <div class="px-6 py-4 border-b border-border-minimal flex items-center justify-between bg-canvas-light">
                    <h3 class="font-display text-lg font-bold text-txt-main">Buat Order Baru</h3>
                    <button wire:click="closeModal" class="text-txt-muted hover:text-txt-main">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div class="p-6">
                    <form wire:submit.prevent="store" class="space-y-5">
                        
                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Pilih Klien dari Lead (Baru)</label>
                            <select wire:model="lead_id" class="form-input">
                                <option value="">-- Buat User Klien dari Lead Converted --</option>
                                @foreach($leads as $lead)
                                    <option value="{{ $lead->id }}">{{ $lead->name }} ({{ $lead->company ?? 'Personal' }})</option>
                                @endforeach
                            </select>
                            <p class="text-[10px] text-txt-muted mt-1">Atau pilih klien yang sudah ada di bawah ini.</p>
                            @error('lead_id') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Pilih Klien (Sudah Terdaftar)</label>
                            <select wire:model="user_id" class="form-input">
                                <option value="">-- Pilih Klien --</option>
                                @foreach($clients as $client)
                                    <option value="{{ $client->id }}">{{ $client->name }} ({{ $client->email }})</option>
                                @endforeach
                            </select>
                            @error('user_id') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Layanan</label>
                            <select wire:model="service_id" class="form-input" required>
                                <option value="">Pilih Layanan</option>
                                @foreach($services as $svc)
                                    <option value="{{ $svc->id }}">{{ $svc->name }}</option>
                                @endforeach
                            </select>
                            @error('service_id') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Nama Proyek</label>
                            <input wire:model="project_name" type="text" class="form-input" required>
                            @error('project_name') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Total Nilai Proyek (Rp)</label>
                            <input wire:model="total_amount" type="number" min="0" class="form-input" required>
                            <p class="text-xs text-txt-muted mt-1">Sistem akan otomatis membuat 3 tagihan milestone (30%, 40%, 30%).</p>
                            @error('total_amount') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div class="pt-4 flex justify-end gap-3 border-t border-border-minimal mt-6">
                            <button type="button" wire:click="closeModal" class="btn-secondary">Batal</button>
                            <button type="submit" class="btn-primary">Buat Order</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif

    <!-- View Order Detail Modal -->
    @if($viewingOrder)
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" x-data="{ open: true }" x-show="open">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in" @click.outside="$wire.closeViewModal()">
                
                <!-- Modal Header -->
                <div class="p-6 border-b border-border-minimal flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h2 class="font-display text-xl font-bold text-txt-main">{{ $viewingOrder->order_number }}</h2>
                        <p class="text-sm text-txt-muted">{{ $viewingOrder->project_name }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        @if(!in_array($viewingOrder->status, ['completed', 'cancelled']))
                            <button wire:click="cancelOrder({{ $viewingOrder->id }})" wire:confirm="Yakin ingin membatalkan order ini? Semua tagihan yang pending akan dibatalkan." class="text-status-danger text-sm font-semibold hover:underline">
                                Batalkan Proyek
                            </button>
                        @endif
                        <button wire:click="closeViewModal" class="text-txt-muted hover:text-txt-main transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Body -->
                <div class="p-6 overflow-y-auto">
                    <!-- Order Info -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div>
                            <p class="text-xs text-txt-muted mb-1">Klien</p>
                            <p class="font-body text-sm font-semibold text-txt-main">{{ $viewingOrder->user->name ?? '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-txt-muted mb-1">Layanan</p>
                            <p class="font-body text-sm font-semibold text-txt-main">{{ $viewingOrder->service->name ?? '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-txt-muted mb-1">Total Nilai</p>
                            <p class="font-body text-sm font-bold text-brand-primary">{{ $viewingOrder->formatted_amount }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-txt-muted mb-1">Status Proyek</p>
                            <span class="badge bg-brand-primary/10 text-brand-primary">{{ ucfirst(str_replace('_', ' ', $viewingOrder->status)) }}</span>
                        </div>
                    </div>

                    <h4 class="font-display text-base font-bold text-txt-main mb-4">Milestone Tagihan (Transactions)</h4>
                    
                    <div class="space-y-4">
                        @foreach($viewingOrder->transactions as $trx)
                            <div class="p-4 rounded-lg border border-border-minimal bg-canvas-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p class="font-body text-sm font-bold text-txt-main">{{ $trx->milestone_name }}</p>
                                    <p class="text-xs text-txt-muted mt-1">{{ $trx->transaction_reference }}</p>
                                </div>
                                <div class="text-left sm:text-right">
                                    <p class="font-display text-sm font-bold text-txt-main">Rp {{ number_format($trx->amount, 0, ',', '.') }}</p>
                                    <div class="mt-1">
                                        @if($trx->status === 'settlement')
                                            <span class="badge bg-status-success/10 text-status-success text-[10px]">Lunas ({{ $trx->settled_at ? $trx->settled_at->format('d M Y') : '' }})</span>
                                        @elseif($trx->status === 'pending')
                                            <span class="badge bg-status-warning/10 text-status-warning text-[10px]">Belum Dibayar</span>
                                        @else
                                            <span class="badge bg-gray-100 text-txt-muted text-[10px]">{{ ucfirst($trx->status) }}</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    @endif
</div>
