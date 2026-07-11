<div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Daftar Leads</h2>
        
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input wire:model.live="search" type="text" class="form-input text-sm py-2" placeholder="Cari nama, email, pt...">
            <select wire:model.live="statusFilter" class="form-input text-sm py-2">
                <option value="">Semua Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
            </select>
        </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">Kontak</th>
                        <th class="px-6 py-4">Proyek & Kebutuhan</th>
                        <th class="px-6 py-4 text-center">Score</th>
                        <th class="px-6 py-4 text-center">Status</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($leads as $lead)
                        <tr class="hover:bg-canvas-light transition-colors cursor-pointer {{ $lead->status === 'new' ? 'bg-brand-primary/5' : '' }}" 
                            wire:click="viewLead({{ $lead->id }})">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-semibold text-txt-main">{{ $lead->name }}</div>
                                <div class="font-body text-xs text-txt-muted">{{ $lead->email }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">{{ $lead->company ?? '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm text-txt-main">{{ ucfirst($lead->service_category) }}</div>
                                <div class="font-body text-xs text-txt-muted truncate max-w-[200px]">{{ $lead->project_description }}</div>
                                <div class="font-body text-[10px] text-txt-muted/70 mt-1">Est: {{ $lead->budget_label }}</div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="badge {{ $lead->lead_score >= 70 ? 'bg-status-success/10 text-status-success' : ($lead->lead_score >= 40 ? 'bg-status-warning/10 text-status-warning' : 'bg-gray-100 text-txt-muted') }}">
                                    {{ $lead->lead_score }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="badge 
                                    @switch($lead->status)
                                        @case('new') bg-brand-primary/10 text-brand-primary @break
                                        @case('contacted') bg-status-info/10 text-status-info @break
                                        @case('qualified') bg-status-warning/10 text-status-warning @break
                                        @case('converted') bg-status-success/10 text-status-success @break
                                        @case('lost') bg-status-danger/10 text-status-danger @break
                                    @endswitch">
                                    {{ ucfirst($lead->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button type="button" wire:click.stop="delete({{ $lead->id }})" wire:confirm="Hapus lead ini?" class="text-status-danger hover:underline text-xs font-medium">Hapus</button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-txt-muted text-sm">Tidak ada data lead.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($leads->hasPages())
            <div class="px-6 py-4 border-t border-border-minimal">
                {{ $leads->links() }}
            </div>
        @endif
    </div>

    <!-- View Lead Modal -->
    @if($isModalOpen && $viewingLead)
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" x-data="{ open: true }" x-show="open">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in" @click.outside="$wire.closeModal()">
                
                <!-- Modal Header -->
                <div class="px-6 py-4 border-b border-border-minimal flex items-center justify-between bg-canvas-light">
                    <h3 class="font-display text-lg font-bold text-txt-main">Detail Lead</h3>
                    <div class="flex items-center gap-4">
                        <span class="badge {{ $viewingLead->lead_score >= 70 ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning' }}">
                            Score: {{ $viewingLead->lead_score }}
                        </span>
                        <button wire:click="closeModal" class="text-txt-muted hover:text-txt-main">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Body -->
                <div class="p-6 overflow-y-auto space-y-6">
                    <!-- Contact Section -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs text-txt-muted mb-1">Nama Lengkap</p>
                            <p class="font-body text-sm font-semibold text-txt-main">{{ $viewingLead->name }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-txt-muted mb-1">Perusahaan</p>
                            <p class="font-body text-sm font-semibold text-txt-main">{{ $viewingLead->company ?? '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-txt-muted mb-1">Email</p>
                            <a href="mailto:{{ $viewingLead->email }}" class="font-body text-sm font-semibold text-brand-primary hover:underline">{{ $viewingLead->email }}</a>
                        </div>
                        <div>
                            <p class="text-xs text-txt-muted mb-1">No. Telepon</p>
                            @if($viewingLead->phone)
                                <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $viewingLead->phone) }}" target="_blank" class="font-body text-sm font-semibold text-status-success hover:underline">{{ $viewingLead->phone }}</a>
                            @else
                                <p class="font-body text-sm font-semibold text-txt-main">-</p>
                            @endif
                        </div>
                    </div>

                    <hr class="border-border-minimal">

                    <!-- Project Details Section -->
                    <div class="space-y-4">
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <p class="text-xs text-txt-muted mb-1">Kategori Layanan</p>
                                <span class="badge bg-brand-primary/10 text-brand-primary text-xs">{{ ucfirst($viewingLead->service_category) }}</span>
                            </div>
                            <div>
                                <p class="text-xs text-txt-muted mb-1">Estimasi Budget</p>
                                <p class="font-body text-sm font-semibold text-txt-main">{{ $viewingLead->budget_label }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-txt-muted mb-1">Target Launch</p>
                                <p class="font-body text-sm font-semibold text-txt-main">{{ $viewingLead->target_launch ?? '-' }}</p>
                            </div>
                        </div>

                        <div>
                            <p class="text-xs text-txt-muted mb-1">Estimasi Halaman/Fitur</p>
                            <p class="font-body text-sm text-txt-main">{{ $viewingLead->estimated_pages ?? '-' }}</p>
                        </div>

                        <div>
                            <p class="text-xs text-txt-muted mb-2">Deskripsi Proyek</p>
                            <div class="p-4 bg-canvas-overlay rounded-lg border border-border-minimal">
                                <p class="font-body text-sm text-txt-main whitespace-pre-wrap">{{ $viewingLead->project_description }}</p>
                            </div>
                        </div>
                    </div>

                    <hr class="border-border-minimal">

                    <!-- Status Action Section -->
                    <div>
                        <p class="text-xs text-txt-muted mb-3">Update Status Lead</p>
                        <div class="flex flex-wrap gap-2">
                            <button wire:click="updateStatus('contacted')" class="px-4 py-2 rounded-lg text-xs font-semibold {{ $viewingLead->status === 'contacted' ? 'bg-status-info text-white' : 'bg-status-info/10 text-status-info hover:bg-status-info/20' }}">Contacted</button>
                            <button wire:click="updateStatus('qualified')" class="px-4 py-2 rounded-lg text-xs font-semibold {{ $viewingLead->status === 'qualified' ? 'bg-status-warning text-white' : 'bg-status-warning/10 text-status-warning hover:bg-status-warning/20' }}">Qualified</button>
                            <button wire:click="updateStatus('converted')" class="px-4 py-2 rounded-lg text-xs font-semibold {{ $viewingLead->status === 'converted' ? 'bg-status-success text-white' : 'bg-status-success/10 text-status-success hover:bg-status-success/20' }}">Converted</button>
                            <button wire:click="updateStatus('lost')" class="px-4 py-2 rounded-lg text-xs font-semibold {{ $viewingLead->status === 'lost' ? 'bg-status-danger text-white' : 'bg-status-danger/10 text-status-danger hover:bg-status-danger/20' }}">Lost</button>
                        </div>
                        @if($viewingLead->status === 'converted')
                            <div class="mt-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                                <p class="text-sm text-txt-main font-medium flex items-center gap-2">
                                    <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    Lead ini sudah dikonversi! Anda dapat membuat Order baru untuk klien ini dari halaman Orders.
                                </p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    @endif
</div>
