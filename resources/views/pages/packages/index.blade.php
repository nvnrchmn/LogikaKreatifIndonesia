<x-layouts.app title="Katalog Paket & Checkout Layanan | Logika Kreatif Indonesia">
    <div class="pt-28 pb-24 bg-canvas-light min-h-screen relative overflow-hidden" x-data="{ selected: 1 }">
        
        <!-- Decorative Glow Background Elements -->
        <div class="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full"></div>

        <div class="container-narrow relative z-10">

            <!-- Hero Header -->
            <div class="text-center max-w-3xl mx-auto mb-16 px-4">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                    <span class="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                    <span>Storefront & Checkout Resmi Logikraf</span>
                </div>
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-txt-main tracking-tight mb-6 leading-tight">
                    Paket Layanan Digital <br class="hidden sm:inline" /><span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">& Website UMKM</span>
                </h1>
                <p class="text-txt-muted text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto font-body">
                    Pilih paket layanan yang sesuai dengan skala bisnis Anda. Pembayaran aman dan terverifikasi secara otomatis via <strong class="text-txt-main font-semibold">Xendit Payment Gateway (Mode Tes & Live IDR)</strong>.
                </p>

                <!-- Xendit Badge Banner -->
                <div class="inline-flex flex-wrap items-center justify-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-border-minimal shadow-sm text-xs font-medium text-txt-muted">
                    <div class="flex items-center gap-2 text-status-success font-semibold">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        <span>Xendit Payment Verified</span>
                    </div>
                    <span class="text-gray-300">•</span>
                    <span>Mata Uang: <strong>IDR (Rupiah)</strong></span>
                    <span class="text-gray-300">•</span>
                    <span>Proses Otomatis</span>
                </div>
            </div>

            <!-- Error Alerts -->
            @if(session('checkout_error'))
                <div class="max-w-2xl mx-auto mb-10 p-4 bg-status-danger/10 text-status-danger rounded-2xl border border-status-danger/20 text-sm font-medium flex items-center gap-3 shadow-sm">
                    <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>{{ session('checkout_error') }}</span>
                </div>
            @endif

            @if($errors->any())
                <div class="max-w-2xl mx-auto mb-10 p-5 bg-status-danger/10 text-status-danger rounded-2xl border border-status-danger/20 text-sm font-medium shadow-sm">
                    <div class="font-bold mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        <span>Mohon periksa data formulir Anda:</span>
                    </div>
                    <ul class="list-disc pl-6 space-y-1 text-xs">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Package Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
                @forelse($packages as $package)
                    <div class="group relative bg-white rounded-3xl p-7 lg:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border {{ $package->is_featured ? 'border-2 border-brand-primary shadow-lg ring-4 ring-brand-primary/10' : 'border-border-minimal shadow-sm hover:border-brand-primary/40' }}">
                        
                        @if($package->is_featured)
                            <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-blue-600 text-white text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                                ⭐ Paling Populer
                            </div>
                        @endif

                        <div class="mb-6">
                            <h3 class="font-display text-xl font-bold text-txt-main group-hover:text-brand-primary transition-colors mb-2">{{ $package->name }}</h3>
                            @if($package->tagline)
                                <p class="text-xs text-txt-muted leading-relaxed min-h-[36px]">{{ $package->tagline }}</p>
                            @endif
                        </div>

                        <div class="mb-6 p-4 rounded-2xl bg-canvas-light border border-border-minimal/60">
                            @if($package->strike_price)
                                <span class="text-xs text-txt-muted line-through block mb-0.5">{{ $package->formatted_strike_price }}</span>
                            @endif
                            <div class="font-display text-3xl font-extrabold text-brand-primary">{{ $package->formatted_price }}</div>
                            <span class="text-[11px] text-txt-muted font-medium mt-1 block">Harga Sudah Termasuk PPN</span>
                        </div>

                        @if($package->features)
                            <div class="mb-8 flex-1">
                                <span class="text-[11px] font-bold text-txt-main uppercase tracking-wider block mb-3">Fitur Layanan:</span>
                                <ul class="space-y-3">
                                    @foreach($package->features as $feature)
                                        <li class="flex items-start gap-2.5 text-xs text-txt-muted leading-relaxed">
                                            <div class="w-4 h-4 rounded-full bg-status-success/15 text-status-success flex items-center justify-center shrink-0 mt-0.5">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                                            </div>
                                            <span>{{ $feature }}</span>
                                        </li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <button type="button"
                            @click="selected = {{ $package->id }}; $nextTick(() => $refs['checkout-section'].scrollIntoView({ behavior: 'smooth', block: 'start' }))"
                            :class="selected === {{ $package->id }} ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white'"
                            class="w-full font-bold py-3.5 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2">
                            <span>Pesan Paket Ini</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                    </div>
                @empty
                    <div class="col-span-3 text-center py-12 bg-white rounded-3xl border border-border-minimal shadow-sm">
                        <p class="text-txt-muted text-sm font-medium">Paket layanan belum dimuat. Silakan jalankan seeder database.</p>
                    </div>
                @endforelse
            </div>

            <!-- Dedicated Checkout Section -->
            <div x-ref="checkout-section" class="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-border-minimal shadow-xl mb-20 relative overflow-hidden">
                
                <div class="flex items-center gap-4 mb-8 pb-6 border-b border-border-minimal">
                    <div class="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                    </div>
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-brand-primary block">Langkah 2: Informasi Pembayaran</span>
                        <h3 class="font-display font-bold text-xl sm:text-2xl text-txt-main">Formulir Checkout & Data Pembeli</h3>
                    </div>
                </div>

                @if($packages->count() > 0)
                    @foreach($packages as $package)
                        <div x-show="selected === {{ $package->id }}" x-cloak x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="space-y-6">
                            
                            <!-- Selected Package Banner Summary -->
                            <div class="p-4 sm:p-5 bg-gradient-to-r from-brand-primary/5 via-blue-500/5 to-transparent rounded-2xl border border-brand-primary/20 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary block mb-0.5">Paket Yang Dipilih</span>
                                    <h4 class="font-bold text-txt-main text-lg">{{ $package->name }}</h4>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-txt-muted block">Total Biaya</span>
                                    <span class="font-display font-extrabold text-xl text-brand-primary">{{ $package->formatted_price }}</span>
                                </div>
                            </div>

                            <form action="{{ route('packages.checkout', $package->slug) }}" method="POST" class="space-y-5">
                                @csrf
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Nama Lengkap / Pelanggan <span class="text-status-danger">*</span></label>
                                        <input type="text" name="guest_name" value="{{ old('guest_name') }}" required
                                            class="w-full px-4 py-3.5 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-txt-main font-medium"
                                            placeholder="Contoh: Budi Santoso">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Alamat Email Pembayar <span class="text-status-danger">*</span></label>
                                        <input type="email" name="guest_email" value="{{ old('guest_email') }}" required
                                            class="w-full px-4 py-3.5 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-txt-main font-medium"
                                            placeholder="budi@example.com">
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Nomor Telepon / WhatsApp <span class="text-status-danger">*</span></label>
                                    <input type="text" name="guest_phone" value="{{ old('guest_phone') }}" required
                                        class="w-full px-4 py-3.5 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-txt-main font-medium"
                                        placeholder="081234567890">
                                </div>

                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-txt-main mb-2">Catatan / Brief Pesanan (Opsional)</label>
                                    <textarea name="project_brief" rows="3"
                                        class="w-full px-4 py-3.5 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-txt-main resize-none font-medium"
                                        placeholder="Tuliskan catatan khusus atau preferensi usaha Anda..."></textarea>
                                </div>

                                <div class="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/15 text-xs text-txt-muted flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                    </div>
                                    <span class="leading-relaxed">Klik di bawah untuk memuat tagihan resmi Xendit. Anda dapat membayar via QRIS, Virtual Account, E-Wallet, atau Kartu Kredit.</span>
                                </div>

                                <button type="submit" class="w-full bg-gradient-to-r from-brand-primary to-blue-600 text-white font-extrabold py-4 rounded-xl hover:opacity-95 transition-all shadow-xl shadow-brand-primary/25 text-base flex items-center justify-center gap-2 active:scale-[0.99]">
                                    <span>Lanjut ke Halaman Pembayaran Xendit</span>
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </button>
                            </form>
                        </div>
                    @endforeach
                @endif
            </div>

            <!-- Business Verification Info Card (Address & Contact Info required by Xendit) -->
            @php
                $companyEmail = \App\Models\Setting::get('company_email', 'hello@logikraf.id');
                $companyPhone = \App\Models\Setting::get('company_phone', '+62 811-1234-5678');
                $companyAddress = \App\Models\Setting::get('company_address', 'Gedung Inovasi Lt. 3, Jl. Jend. Sudirman No. 123, Jakarta Selatan, 12190');
            @endphp
            
            <div class="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-white/10 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                <div class="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                    <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01"/></svg>
                    </div>
                    <div>
                        <h4 class="font-display font-bold text-lg sm:text-xl text-white">Informasi Entitas Bisnis & Kontak Resmi</h4>
                        <p class="text-xs text-slate-400">Detail legalitas perusahaan yang terdaftar secara resmi di Xendit Payment Gateway:</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span class="text-slate-400 text-xs block mb-1 font-semibold uppercase tracking-wider">Nama Usaha / Perusahaan</span>
                        <strong class="text-white text-base font-bold">PT. Logika Kreatif Indonesia (Logikraf)</strong>
                    </div>

                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span class="text-slate-400 text-xs block mb-1 font-semibold uppercase tracking-wider">Mata Uang Operasional</span>
                        <strong class="text-blue-400 text-base font-bold">IDR (Rupiah Indonesia)</strong>
                    </div>

                    <div class="sm:col-span-2 bg-gradient-to-r from-blue-950/40 via-slate-800/60 to-blue-950/40 p-5 rounded-2xl border border-blue-500/20">
                        <span class="text-blue-300 text-xs font-bold block mb-1 uppercase tracking-wider">Deskripsi Kegiatan Usaha (Business Activity)</span>
                        <p class="text-white font-medium italic text-sm sm:text-base leading-relaxed">
                            "Micro-scale business engaged in computer programming and other computer-related activities."
                        </p>
                        <span class="text-slate-400 text-xs mt-1.5 block font-normal">(Layanan Pemrograman Komputer & Solusi Teknologi Informasi)</span>
                    </div>

                    <div class="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                        <div>
                            <span class="text-slate-400 text-xs block mb-0.5 font-semibold uppercase tracking-wider">Email Support & Info</span>
                            <p class="text-white font-medium text-sm">{{ $companyEmail }}</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </div>
                        <div>
                            <span class="text-slate-400 text-xs block mb-0.5 font-semibold uppercase tracking-wider">Telepon / WhatsApp</span>
                            <p class="text-white font-medium text-sm">{{ $companyPhone }}</p>
                        </div>
                    </div>

                    <div class="sm:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <div>
                            <span class="text-slate-400 text-xs block mb-0.5 font-semibold uppercase tracking-wider">Alamat Kantor Fisik Perusahaan</span>
                            <p class="text-white font-medium text-sm leading-relaxed">{!! nl2br(e($companyAddress)) !!}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</x-layouts.app>