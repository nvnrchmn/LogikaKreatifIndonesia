<x-layouts.app title="Katalog Paket & Checkout | Logika Kreatif Indonesia">
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen" x-data="{ selected: 1 }">
        <div class="container-narrow">

            <!-- Header -->
            <div class="text-center max-w-3xl mx-auto mb-12">
                <span class="badge-primary mb-4">Storefront & Checkout Layanan</span>
                <h1 class="text-4xl font-display font-bold text-txt-main mb-4">Paket Layanan Digital & Website UMKM</h1>
                <p class="text-txt-muted text-sm leading-relaxed mb-4">
                    Pilih paket layanan digital yang sesuai dengan kebutuhan bisnis Anda. Pembayaran aman dan
                    terverifikasi secara otomatis via <strong>Xendit Payment Gateway (Mode Tes & Live IDR)</strong>.
                </p>
                <div
                    class="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-xs font-semibold">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Mata Uang: IDR (Rupiah) — Terintegrasi Resmi Xendit Invoice</span>
                </div>
            </div>

            @if(session('checkout_error'))
                <div
                    class="max-w-2xl mx-auto mb-10 p-4 bg-status-danger/10 text-status-danger rounded-lg border border-status-danger/20 text-sm font-medium">
                    {{ session('checkout_error') }}
                </div>
            @endif

            @if($errors->any())
                <div
                    class="max-w-2xl mx-auto mb-10 p-4 bg-status-danger/10 text-status-danger rounded-lg border border-status-danger/20 text-sm font-medium">
                    <ul class="list-disc pl-5 space-y-1">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Package Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
                @forelse($packages as $package)
                    <div
                        class="relative card-hover p-8 flex flex-col {{ $package->is_featured ? 'border-2 border-brand-primary shadow-lg' : '' }}">
                        @if($package->is_featured)
                            <span
                                class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                                Paling Populer
                            </span>
                        @endif

                        <h3 class="font-display text-xl font-bold text-txt-main mb-1">{{ $package->name }}</h3>
                        @if($package->tagline)
                            <p class="text-sm text-txt-muted mb-6">{{ $package->tagline }}</p>
                        @endif

                        <div class="mb-6">
                            @if($package->strike_price)
                                <span
                                    class="text-sm text-txt-muted line-through mr-2">{{ $package->formatted_strike_price }}</span>
                            @endif
                            <div class="font-display text-3xl font-bold text-brand-primary">{{ $package->formatted_price }}
                            </div>
                        </div>

                        @if($package->features)
                            <ul class="space-y-3 mb-8 flex-1">
                                @foreach($package->features as $feature)
                                    <li class="flex items-start gap-2 text-sm text-txt-muted">
                                        <svg class="w-5 h-5 text-status-success shrink-0" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{{ $feature }}</span>
                                    </li>
                                @endforeach
                            </ul>
                        @endif

                        <button type="button"
                            @click="selected = {{ $package->id }}; $nextTick(() => $refs['checkout-section'].scrollIntoView({ behavior: 'smooth', block: 'start' }))"
                            :class="selected === {{ $package->id }} ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white'"
                            class="w-full font-semibold py-3 rounded-xl transition-all duration-200">
                            Pesan & Checkout Now
                        </button>
                    </div>
                @empty
                    <p class="text-center text-txt-muted col-span-3 py-8">Paket layanan belum dimuat. Silakan jalankan
                        db:seed.</p>
                @endforelse
            </div>

            <!-- Single Dedicated Checkout Form (Always visible for easy Xendit review) -->
            <div x-ref="checkout-section"
                class="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-border-minimal shadow-md mb-16">
                <div class="flex items-center gap-3 mb-6 pb-6 border-b border-border-minimal">
                    <div
                        class="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-display font-bold text-2xl text-txt-main">Formulir Checkout Produk & Pembayaran
                        </h3>
                        <p class="text-xs text-txt-muted">Pilih paket di bawah ini untuk memproses tagihan resmi via
                            Xendit.</p>
                    </div>
                </div>

                @if($packages->count() > 0)
                    @php
                        $firstPkg = $packages->first();
                    @endphp
                    @foreach($packages as $package)
                        <div x-show="selected === {{ $package->id }}" class="space-y-6">
                            <div
                                class="p-4 bg-canvas-light rounded-2xl border border-border-minimal flex items-center justify-between">
                                <div>
                                    <span class="text-xs font-semibold text-brand-primary uppercase tracking-wider">Paket
                                        Dipilih</span>
                                    <h4 class="font-bold text-txt-main text-lg">{{ $package->name }}</h4>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-txt-muted block">Harga Paket</span>
                                    <span
                                        class="font-display font-bold text-xl text-txt-main">{{ $package->formatted_price }}</span>
                                </div>
                            </div>

                            <form action="{{ route('packages.checkout', $package->slug) }}" method="POST" class="space-y-5">
                                @csrf
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            class="block text-xs font-semibold uppercase tracking-wider text-txt-main mb-2">Nama
                                            Lengkap / Pelanggan *</label>
                                        <input type="text" name="guest_name" value="{{ old('guest_name') }}" required
                                            class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main"
                                            placeholder="Contoh: John Doe">
                                    </div>
                                    <div>
                                        <label
                                            class="block text-xs font-semibold uppercase tracking-wider text-txt-main mb-2">Alamat
                                            Email Pembayar *</label>
                                        <input type="email" name="guest_email" value="{{ old('guest_email') }}" required
                                            class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main"
                                            placeholder="john@example.com">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-txt-main mb-2">Nomor
                                        Telepon / WhatsApp *</label>
                                    <input type="text" name="guest_phone" value="{{ old('guest_phone') }}" required
                                        class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main"
                                        placeholder="081234567890">
                                </div>
                                <div>
                                    <label
                                        class="block text-xs font-semibold uppercase tracking-wider text-txt-main mb-2">Catatan
                                        / Deskripsi Pesanan (Opsional)</label>
                                    <textarea name="project_brief" rows="2"
                                        class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main resize-none"
                                        placeholder="Catatan tambahan pesanan jasa..."></textarea>
                                </div>

                                <div
                                    class="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10 text-xs text-txt-muted flex items-center gap-3">
                                    <svg class="w-6 h-6 text-brand-primary shrink-0" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Klik di bawah untuk memuat invoice Xendit. Anda akan diajukan ke gateway pembayaran
                                        resmi Xendit.</span>
                                </div>

                                <button type="submit"
                                    class="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/30 flex items-center justify-center gap-2">
                                    <span>Lanjut ke Halaman Pembayaran Xendit</span>
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
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
            <div
                class="max-w-2xl mx-auto bg-canvas-dark rounded-3xl p-8 text-white shadow-lg border border-brand-primary/30">
                <h4 class="font-display font-bold text-xl text-white mb-2">Informasi Bisnis & Kontak Resmi</h4>
                <p class="text-xs text-txt-light/70 mb-6">Berikut detail entitas bisnis sesuai pendaftaran resmi di
                    Xendit Payment Gateway:</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <span class="text-txt-light/50 text-xs block mb-1 uppercase tracking-wider">Nama Usaha /
                            Perusahaan</span>
                        <strong class="text-white text-base">PT. Logika Kreatif Indonesia (Logikraf)</strong>
                    </div>
                    <div>
                        <span class="text-txt-light/50 text-xs block mb-1 uppercase tracking-wider">Mata Uang
                            Transaksi</span>
                        <strong class="text-white text-base">IDR (Rupiah)</strong>
                    </div>
                    <div class="md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/10">
                        <span class="text-txt-light/50 text-xs block mb-1 uppercase tracking-wider">Deskripsi Kegiatan
                            Usaha (Business Activity)</span>
                        <p class="text-white font-medium italic text-sm">"Micro-scale business engaged in computer
                            programming and other computer-related activities."</p>
                        <span class="text-txt-light/60 text-xs mt-1 block">(Layanan Pemrograman Komputer & Solusi
                            Teknologi Informasi)</span>
                    </div>
                    <div>
                        <span class="text-txt-light/50 text-xs block mb-1 uppercase tracking-wider">Email Layanan &
                            Support</span>
                        <p class="text-txt-light/90">{{ $companyEmail }}</p>
                    </div>
                    <div>
                        <span class="text-txt-light/50 text-xs block mb-1 uppercase tracking-wider">Telepon & WhatsApp
                            Kontak</span>
                        <p class="text-txt-light/90">{{ $companyPhone }}</p>
                    </div>
                    <div class="md:col-span-2 border-t border-white/10 pt-4 mt-2">
                        <span class="text-txt-light/50 text-xs block mb-1 uppercase tracking-wider">Alamat Kantor
                            Fisik</span>
                        <p class="text-txt-light/90 leading-relaxed">{!! nl2br(e($companyAddress)) !!}</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</x-layouts.app>