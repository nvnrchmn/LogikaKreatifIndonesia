<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">{{ $testimonial && $testimonial->exists ? 'Edit' : 'Tambah' }} Testimonial</h2>
        <a href="{{ route('admin.testimonials.index') }}" class="text-txt-muted hover:text-txt-main text-sm">← Kembali</a>
    </div>

    @if (session()->has('success'))
        <div class="bg-green-100 text-green-800 text-sm p-3 rounded-lg mb-4">{{ session('success') }}</div>
    @endif

    <div class="card p-6 space-y-4 max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Nama Klien *</label>
                <input type="text" wire:model="client_name" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
                @error('client_name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Perusahaan</label>
                <input type="text" wire:model="company" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-txt-main mb-1">Posisi/Jabatan</label>
            <input type="text" wire:model="position" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
        </div>
        <div>
            <label class="block text-sm font-medium text-txt-main mb-1">Testimonial *</label>
            <textarea wire:model="content" rows="4" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm"></textarea>
            @error('content') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>
        <div class="flex gap-6">
            <label class="flex items-center gap-2 text-sm text-txt-main">
                <input type="checkbox" wire:model="is_approved" class="rounded"> Approved (tampil di web)
            </label>
            <label class="flex items-center gap-2 text-sm text-txt-main">
                <input type="checkbox" wire:model="is_featured" class="rounded"> Featured
            </label>
        </div>
        <div class="w-32">
            <label class="block text-sm font-medium text-txt-main mb-1">Sort Order</label>
            <input type="number" wire:model="sort_order" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
        </div>
        <div class="flex justify-end">
            <button type="button" wire:click="save" class="btn-primary text-sm !py-3 !px-8">Simpan</button>
        </div>
    </div>
</div>
