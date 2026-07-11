<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Daftar Layanan</h2>
        <button wire:click="create" class="btn-primary">
            + Tambah Layanan
        </button>
    </div>

    <!-- Search -->
    <div class="mb-6 max-w-sm">
        <input wire:model.live="search" type="text" class="form-input" placeholder="Cari layanan...">
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">Nama</th>
                        <th class="px-6 py-4">Kategori</th>
                        <th class="px-6 py-4">Harga Dasar</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($services as $service)
                        <tr class="hover:bg-canvas-light transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-semibold text-txt-main">{{ $service->name }}</div>
                                <div class="font-body text-xs text-txt-muted truncate max-w-xs">{{ $service->short_description }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="badge bg-brand-primary/10 text-brand-primary text-[10px]">{{ $service->category }}</span>
                            </td>
                            <td class="px-6 py-4 font-body text-sm text-txt-main">
                                Rp {{ number_format($service->base_price, 0, ',', '.') }}
                            </td>
                            <td class="px-6 py-4">
                                @if($service->is_active)
                                    <span class="badge bg-status-success/10 text-status-success text-[10px]">Aktif</span>
                                @else
                                    <span class="badge bg-status-danger/10 text-status-danger text-[10px]">Non-aktif</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button wire:click="edit({{ $service->id }})" class="text-brand-primary hover:underline text-sm font-medium">Edit</button>
                                <button wire:click="delete({{ $service->id }})" wire:confirm="Yakin ingin menghapus layanan ini?" class="text-status-danger hover:underline text-sm font-medium">Hapus</button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-txt-muted text-sm">Tidak ada data layanan.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($services->hasPages())
            <div class="px-6 py-4 border-t border-border-minimal">
                {{ $services->links() }}
            </div>
        @endif
    </div>

    <!-- Modal Form -->
    @if($isModalOpen)
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" x-data="{ open: true }" x-show="open">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in" @click.outside="$wire.closeModal()">
                <div class="px-6 py-4 border-b border-border-minimal flex items-center justify-between bg-canvas-light">
                    <h3 class="font-display text-lg font-bold text-txt-main">{{ $serviceId ? 'Edit Layanan' : 'Tambah Layanan' }}</h3>
                    <button wire:click="closeModal" class="text-txt-muted hover:text-txt-main">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto">
                    <form wire:submit.prevent="store" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Nama Layanan</label>
                                <input wire:model="name" type="text" class="form-input" required>
                                @error('name') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Kategori</label>
                                <select wire:model="category" class="form-input" required>
                                    <option value="">Pilih Kategori</option>
                                    <option value="software">Software</option>
                                    <option value="uiux">UI/UX</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="branding">Branding</option>
                                </select>
                                @error('category') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                        </div>

                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Deskripsi Singkat (Max 255 char)</label>
                            <input wire:model="short_description" type="text" class="form-input">
                            @error('short_description') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div>
                            <label class="block font-body text-sm font-medium text-txt-main mb-2">Deskripsi Lengkap</label>
                            <textarea wire:model="description" rows="4" class="form-input" required></textarea>
                            @error('description') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Harga Dasar (Rp)</label>
                                <input wire:model="base_price" type="number" min="0" class="form-input" required>
                                @error('base_price') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-sm font-medium text-txt-main mb-2">Urutan Tampil</label>
                                <input wire:model="sort_order" type="number" min="0" class="form-input" required>
                                @error('sort_order') <span class="text-status-danger text-xs mt-1">{{ $message }}</span> @enderror
                            </div>
                            <div class="flex items-end pb-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input wire:model="is_active" type="checkbox" class="w-4 h-4 text-brand-primary border-border-minimal rounded">
                                    <span class="font-body text-sm text-txt-main">Aktif</span>
                                </label>
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end gap-3 border-t border-border-minimal mt-6">
                            <button type="button" wire:click="closeModal" class="btn-secondary">Batal</button>
                            <button type="submit" class="btn-primary">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif
</div>
