<div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h2 class="font-display text-xl font-bold text-txt-main">Kelola Paket Layanan & Pricing</h2>
            <p class="text-xs text-txt-muted">Tambah, ubah, atau hapus paket layanan digital yang tampil di storefront /paket.</p>
        </div>
        <button wire:click="create" class="btn-primary flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ Tambah Paket Baru</span>
        </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="mb-6 max-w-sm">
        <input wire:model.live="search" type="text" class="form-input" placeholder="Cari nama paket...">
    </div>

    <!-- Data Table Card -->
    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-overlay border-b border-border-minimal text-xs font-semibold text-txt-muted uppercase tracking-wider">
                        <th class="px-6 py-4">Paket & Tagline</th>
                        <th class="px-6 py-4">Harga (IDR)</th>
                        <th class="px-6 py-4">Unggulan</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4">Urutan</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($packages as $pkg)
                        <tr class="hover:bg-canvas-light transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $pkg->name }}</div>
                                <div class="font-body text-xs text-txt-muted truncate max-w-xs">{{ $pkg->tagline ?? '-' }}</div>
                            </td>
                            <td class="px-6 py-4 font-body text-sm font-semibold text-txt-main">
                                {{ $pkg->formatted_price }}
                                @if($pkg->strike_price)
                                    <span class="text-xs text-txt-muted line-through block font-normal">{{ $pkg->formatted_strike_price }}</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <button wire:click="toggleFeatured({{ $pkg->id }})" class="cursor-pointer">
                                    @if($pkg->is_featured)
                                        <span class="badge bg-brand-primary/10 text-brand-primary text-[10px] font-bold">⭐ Ya (Populer)</span>
                                    @else
                                        <span class="badge bg-gray-100 text-txt-muted text-[10px]">Biasa</span>
                                    @endif
                                </button>
                            </td>
                            <td class="px-6 py-4">
                                <button wire:click="toggleActive({{ $pkg->id }})" class="cursor-pointer">
                                    @if($pkg->is_active)
                                        <span class="badge bg-status-success/10 text-status-success text-[10px] font-semibold">Aktif</span>
                                    @else
                                        <span class="badge bg-status-danger/10 text-status-danger text-[10px] font-semibold">Non-aktif</span>
                                    @endif
                                </button>
                            </td>
                            <td class="px-6 py-4 font-body text-sm text-txt-muted">
                                {{ $pkg->sort_order }}
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button wire:click="edit({{ $pkg->id }})" class="text-brand-primary hover:underline text-sm font-medium">Edit</button>
                                <button wire:click="delete({{ $pkg->id }})" wire:confirm="Yakin ingin menghapus paket ini?" class="text-status-danger hover:underline text-sm font-medium">Hapus</button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-txt-muted text-sm">Belum ada data paket. Klik "+ Tambah Paket Baru" di atas.</td>
                        </tr>
                    @endempty
                </tbody>
            </table>
        </div>
        @if($packages->hasPages())
            <div class="px-6 py-4 border-t border-border-minimal">
                {{ $packages->links() }}
            </div>
        @endif
    </div>

    <!-- Modal Form (Create / Edit) -->
    @if($isModalOpen)
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" x-data="{ open: true }" x-show="open">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in" @click.outside="$wire.closeModal()">
                <div class="px-6 py-4 border-b border-border-minimal flex items-center justify-between bg-canvas-light">
                    <h3 class="font-display text-lg font-bold text-txt-main">{{ $packageId ? 'Edit Paket Layanan' : 'Tambah Paket Baru' }}</h3>
                    <button wire:click="closeModal" class="text-txt-muted hover:text-txt-main">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto">
                    <form wire:submit.prevent="store" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label class="block font-body text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Nama Paket *</label>
                                <input wire:model="name" type="text" class="form-input" placeholder="Cth: Starter / Bisnis / Pro" required>
                                @error('name') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Tagline / Deskripsi Singkat</label>
                                <input wire:model="tagline" type="text" class="form-input" placeholder="Cth: Cocok untuk usaha yang baru online">
                                @error('tagline') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label class="block font-body text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Harga Utama (IDR) *</label>
                                <input wire:model="price" type="number" min="0" class="form-input" placeholder="1500000" required>
                                @error('price') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                            </div>
                            <div>
                                <label class="block font-body text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Harga Coret / Diskonto (Opsional)</label>
                                <input wire:model="strike_price" type="number" min="0" class="form-input" placeholder="2000000">
                                @error('strike_price') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                            </div>
                        </div>

                        <div>
                            <label class="block font-body text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Daftar Fitur (Satu fitur per baris)</label>
                            <textarea wire:model="features_text" rows="5" class="form-input font-mono text-xs" placeholder="1 halaman website profil usaha&#10;Desain responsif mobile & desktop&#10;Tombol WhatsApp langsung&#10;Selesai 5 hari kerja"></textarea>
                            <span class="text-xs text-txt-muted mt-1 block">Tuliskan tiap poin fitur pada baris baru (Enter).</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                            <div>
                                <label class="block font-body text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Urutan Tampil</label>
                                <input wire:model="sort_order" type="number" min="0" class="form-input" required>
                            </div>
                            <div class="flex items-center pt-4">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input wire:model="is_featured" type="checkbox" class="w-4 h-4 text-brand-primary border-border-minimal rounded">
                                    <span class="font-body text-xs font-semibold text-txt-main">Tandai Paling Populer</span>
                                </label>
                            </div>
                            <div class="flex items-center pt-4">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input wire:model="is_active" type="checkbox" class="w-4 h-4 text-brand-primary border-border-minimal rounded">
                                    <span class="font-body text-xs font-semibold text-txt-main">Status Aktif</span>
                                </label>
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end gap-3 border-t border-border-minimal mt-6">
                            <button type="button" wire:click="closeModal" class="btn-secondary">Batal</button>
                            <button type="submit" class="btn-primary">Simpan Paket</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif
</div>
