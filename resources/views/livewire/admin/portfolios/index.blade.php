<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Daftar Portofolio</h2>
        <button wire:click="create" class="btn-primary">
            + Tambah Portofolio
        </button>
    </div>

    <!-- Search -->
    <div class="mb-6 max-w-sm">
        <input wire:model.live="search" type="text" class="form-input" placeholder="Cari portofolio...">
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">Thumbnail</th>
                        <th class="px-6 py-4">Proyek & Klien</th>
                        <th class="px-6 py-4">Layanan</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($portfolios as $portfolio)
                        <tr class="hover:bg-canvas-light transition-colors">
                            <td class="px-6 py-4">
                                @if($portfolio->thumbnail)
                                    <img src="{{ $portfolio->thumbnail_url }}" alt="Thumb" class="w-16 h-12 object-cover rounded border border-border-minimal">
                                @else
                                    <div class="w-16 h-12 bg-canvas-overlay rounded border border-border-minimal flex items-center justify-center text-xs text-txt-muted">No Img</div>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-semibold text-txt-main">{{ $portfolio->title }}</div>
                                <div class="font-body text-xs text-txt-muted">{{ $portfolio->client_name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="font-body text-sm text-txt-main">{{ $portfolio->service->name ?? '-' }}</span>
                            </td>
                            <td class="px-6 py-4 space-y-1">
                                <div>
                                    @if($portfolio->is_published)
                                        <span class="badge bg-status-success/10 text-status-success text-[10px]">Published</span>
                                    @else
                                        <span class="badge bg-status-warning/10 text-status-warning text-[10px]">Draft</span>
                                    @endif
                                </div>
                                @if($portfolio->is_featured)
                                    <div><span class="badge bg-brand-primary/10 text-brand-primary text-[10px]">Featured</span></div>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button wire:click="edit({{ $portfolio->id }})" class="text-brand-primary hover:underline text-sm font-medium">Edit</button>
                                <button wire:click="delete({{ $portfolio->id }})" wire:confirm="Yakin ingin menghapus portofolio ini?" class="text-status-danger hover:underline text-sm font-medium">Hapus</button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-txt-muted text-sm">Tidak ada data portofolio.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($portfolios->hasPages())
            <div class="px-6 py-4 border-t border-border-minimal">
                {{ $portfolios->links() }}
            </div>
        @endif
    </div>

    <!-- Modal Form -->
    @if($isModalOpen)
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" x-data="{ open: true }" x-show="open">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in" @click.outside="$wire.closeModal()">
                <div class="px-6 py-4 border-b border-border-minimal flex items-center justify-between bg-canvas-light shrink-0">
                    <h3 class="font-display text-lg font-bold text-txt-main">{{ $portfolioId ? 'Edit Portofolio' : 'Tambah Portofolio' }}</h3>
                    <button wire:click="closeModal" class="text-txt-muted hover:text-txt-main">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto">
                    <form wire:submit.prevent="store" class="space-y-6">
                        
                        <!-- Basic Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Judul Proyek</label>
                                <input wire:model="title" type="text" class="form-input" required>
                                @error('title') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Layanan / Kategori</label>
                                <select wire:model="service_id" class="form-input" required>
                                    <option value="">Pilih Layanan</option>
                                    @foreach($services as $svc)
                                        <option value="{{ $svc->id }}">{{ $svc->name }}</option>
                                    @endforeach
                                </select>
                                @error('service_id') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Nama Klien</label>
                                <input wire:model="client_name" type="text" class="form-input" required>
                                @error('client_name') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">URL Proyek (Opsional)</label>
                                <input wire:model="project_url" type="url" class="form-input" placeholder="https://...">
                                @error('project_url') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                        </div>

                        <!-- Details -->
                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Excerpt (Ringkasan singkat, max 255 char)</label>
                            <input wire:model="excerpt" type="text" class="form-input">
                            @error('excerpt') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Deskripsi Lengkap</label>
                            <textarea wire:model="description" rows="4" class="form-input" required></textarea>
                            @error('description') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <!-- Case Study -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Tantangan (Opsional)</label>
                                <textarea wire:model="challenge" rows="3" class="form-input"></textarea>
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Solusi (Opsional)</label>
                                <textarea wire:model="solution" rows="3" class="form-input"></textarea>
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Hasil (Opsional)</label>
                                <textarea wire:model="result" rows="3" class="form-input"></textarea>
                            </div>
                        </div>

                        <!-- Media & Extras -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Tech Stack (Pisahkan dengan koma)</label>
                                <input wire:model="tech_stack" type="text" class="form-input" placeholder="Laravel, React, Tailwind CSS">
                                @error('tech_stack') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Tanggal Selesai</label>
                                <input wire:model="completed_at" type="date" class="form-input">
                                @error('completed_at') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Thumbnail Baru (Otomatis compress ke WebP)</label>
                                <input wire:model="thumbnail" type="file" class="form-input" accept="image/*">
                                <div wire:loading wire:target="thumbnail" class="text-xs text-brand-primary mt-1">Mengupload...</div>
                                @error('thumbnail') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                                
                                @if ($thumbnail)
                                    <div class="mt-2 text-xs text-status-success">Gambar siap disimpan.</div>
                                @elseif($existing_thumbnail)
                                    <div class="mt-2 text-xs text-txt-muted">Sudah ada thumbnail saat ini.</div>
                                @endif
                            </div>
                            
                            <div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block font-body text-sm font-medium text-txt-main mb-2">Urutan Tampil</label>
                                        <input wire:model="sort_order" type="number" min="0" class="form-input" required>
                                    </div>
                                    <div class="space-y-3 pt-6">
                                        <label class="flex items-center gap-2 cursor-pointer">
                                            <input wire:model="is_published" type="checkbox" class="w-4 h-4 text-brand-primary border-border-minimal rounded">
                                            <span class="font-body text-sm text-txt-main">Published</span>
                                        </label>
                                        <label class="flex items-center gap-2 cursor-pointer">
                                            <input wire:model="is_featured" type="checkbox" class="w-4 h-4 text-brand-primary border-border-minimal rounded">
                                            <span class="font-body text-sm text-txt-main">Featured</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end gap-3 border-t border-border-minimal mt-8 shrink-0">
                            <button type="button" wire:click="closeModal" class="btn-secondary">Batal</button>
                            <button type="submit" class="btn-primary" wire:loading.attr="disabled">
                                <span wire:loading.remove wire:target="store">Simpan Portofolio</span>
                                <span wire:loading wire:target="store">Menyimpan...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif
</div>
