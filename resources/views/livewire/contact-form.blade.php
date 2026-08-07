<div>
    @if ($submitted)
        <div class="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center">
            <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <h4 class="font-display font-bold text-lg mb-1">Pesan Terkirim!</h4>
            <p class="text-sm">Terima kasih, tim Logikraf akan menghubungi Anda dalam 1x24 jam.</p>
        </div>
    @else
        <form wire:submit.prevent="submit" class="space-y-5" novalidate>
            @if (session('error'))
                <div class="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
                    {{ session('error') }}
                </div>
            @endif

            <div>
                <label class="block text-sm font-semibold text-txt-main mb-2">Nama Lengkap</label>
                <input type="text" wire:model="name" class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main @error('name') border-red-400 @enderror" placeholder="John Doe">
                @error('name') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
            </div>

            <div>
                <label class="block text-sm font-semibold text-txt-main mb-2">Email</label>
                <input type="email" wire:model="email" class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main @error('email') border-red-400 @enderror" placeholder="john@example.com">
                @error('email') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
            </div>

            <div>
                <label class="block text-sm font-semibold text-txt-main mb-2">Kategori Pesan</label>
                <select wire:model="category" class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main @error('category') border-red-400 @enderror">
                    <option value="">Pilih kategori...</option>
                    <option value="proyek_agensi">Proyek Agensi Baru</option>
                    <option value="saas_sales">Pertanyaan / Sales SaaS</option>
                    <option value="dukungan_teknis">Dukungan Teknis (Support)</option>
                    <option value="lainnya">Lainnya</option>
                </select>
                @error('category') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
            </div>

            <div>
                <label class="block text-sm font-semibold text-txt-main mb-2">Pesan</label>
                <textarea wire:model="message" rows="4" class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main resize-none @error('message') border-red-400 @enderror" placeholder="Tuliskan pesan Anda di sini..."></textarea>
                @error('message') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
            </div>

            <button type="submit" wire:loading.attr="disabled" class="w-full bg-brand-primary text-white font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/30 disabled:opacity-60">
                <span wire:loading> Mengirim... </span>
                <span wire:loading.remove> Kirim Pesan Sekarang </span>
            </button>
        </form>
    @endif
</div>
