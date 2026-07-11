<section class="min-h-screen bg-canvas-dark flex items-center justify-center py-12 px-4 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 gradient-radial-hero opacity-50"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px]"></div>
    
    <div class="max-w-md w-full space-y-8 relative z-10">
        <div class="text-center">
            <h2 class="font-display text-3xl font-bold text-white mb-2">Keamanan Akun</h2>
            <p class="font-body text-txt-muted text-sm">Demi keamanan, Anda wajib mengganti password default (logikraf123) sebelum melanjutkan ke dasbor.</p>
        </div>

        <div class="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
            <form wire:submit="save" class="space-y-6">
                <div>
                    <label for="password" class="block font-body text-sm font-medium text-white/80 mb-2">Password Baru</label>
                    <input wire:model="password" id="password" type="password" class="w-full px-4 py-3 bg-canvas-dark/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="Minimal 8 karakter">
                    @error('password') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label for="password_confirmation" class="block font-body text-sm font-medium text-white/80 mb-2">Konfirmasi Password Baru</label>
                    <input wire:model="password_confirmation" id="password_confirmation" type="password" class="w-full px-4 py-3 bg-canvas-dark/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" placeholder="Ulangi password baru">
                </div>

                <button type="submit" class="w-full btn-primary py-3 flex justify-center items-center">
                    <span wire:loading.remove wire:target="save">Simpan Password</span>
                    <span wire:loading wire:target="save" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                    </span>
                </button>
            </form>
        </div>
    </div>
</section>
