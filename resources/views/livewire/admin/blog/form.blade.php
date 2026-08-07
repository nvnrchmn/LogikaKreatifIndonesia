<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">{{ $post && $post->exists ? 'Edit Artikel' : 'Tulis Artikel' }}</h2>
        <a href="{{ route('admin.blog.index') }}" class="text-txt-muted text-sm">← Kembali</a>
    </div>

    @if (session('message'))
        <div class="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3 text-sm mb-4">{{ session('message') }}</div>
    @endif

    <form wire:submit.prevent="save" class="card p-6 space-y-5 max-w-3xl">
        <div>
            <label class="block text-sm font-semibold text-txt-main mb-2">Judul</label>
            <input wire:model="title" class="form-input w-full" placeholder="Judul artikel">
            @error('title') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block text-sm font-semibold text-txt-main mb-2">Slug (URL)</label>
            <input wire:model="slug" class="form-input w-full" placeholder="judul-artikel">
            @error('slug') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block text-sm font-semibold text-txt-main mb-2">Ringkasan</label>
            <textarea wire:model="excerpt" rows="2" class="form-input w-full" placeholder="Ringkasan singkat..."></textarea>
        </div>

        <div>
            <label class="block text-sm font-semibold text-txt-main mb-2">Konten</label>
            <textarea wire:model="body" rows="10" class="form-input w-full font-mono text-sm" placeholder="Tulis artikel di sini..."></textarea>
            @error('body') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block text-sm font-semibold text-txt-main mb-2">Gambar (URL)</label>
            <input wire:model="featured_image" class="form-input w-full" placeholder="https://...">
        </div>

        <label class="flex items-center gap-2">
            <input type="checkbox" wire:model="is_published" class="rounded">
            <span class="text-sm text-txt-main">Publikasikan sekarang</span>
        </label>

        <button type="submit" class="bg-brand-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-primary/90">Simpan</button>
    </form>
</div>
