<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">{{ $client && $client->exists ? 'Edit' : 'Tambah' }} Client</h2>
        <a href="{{ route('admin.clients.index') }}" class="text-txt-muted hover:text-txt-main text-sm">← Kembali</a>
    </div>

    @if (session()->has('success'))
        <div class="bg-green-100 text-green-800 text-sm p-3 rounded-lg mb-4">{{ session('success') }}</div>
    @endif

    <div class="card p-6 space-y-4 max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Nama Perusahaan</label>
                <input type="text" wire:model="company_name" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Nama PIC *</label>
                <input type="text" wire:model="pic_name" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
                @error('pic_name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Email</label>
                <input type="email" wire:model="email" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
                @error('email') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Phone</label>
                <input type="text" wire:model="phone" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-txt-main mb-1">Alamat</label>
            <textarea wire:model="address" rows="2" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm"></textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Kota</label>
                <input type="text" wire:model="city" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Notes</label>
                <input type="text" wire:model="notes" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
        </div>
        <div class="flex justify-end">
            <button type="button" wire:click="save" class="btn-primary text-sm !py-3 !px-8">Simpan</button>
        </div>
    </div>
</div>
