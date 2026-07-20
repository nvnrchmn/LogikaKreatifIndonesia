<x-layouts.app title="Paket Website UMKM | Logika Kreatif Indonesia">
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen" x-data="{ selected: null }">
        <div class="container-narrow">

            <!-- Header -->
            <div class="text-center max-w-2xl mx-auto mb-16">
                <span class="badge-primary mb-4">Paket Website UMKM</span>
                <h1 class="text-4xl font-display font-bold text-txt-main mb-4">Harga Tetap, Proses Cepat</h1>
                <p class="text-txt-muted text-sm leading-relaxed">
                    Website siap pakai untuk usaha kecil-menengah. Pilih paket, isi data, bayar aman lewat Xendit —
                    tim kami langsung mulai kerjakan.
                </p>
            </div>

            @if(session('checkout_error'))
                <div class="max-w-2xl mx-auto mb-10 p-4 bg-status-danger/10 text-status-danger rounded-lg border border-status-danger/20 text-sm font-medium">
                    {{ session('checkout_error') }}
                </div>
            @endif

            @if($errors->any())
                <div class="max-w-2xl mx-auto mb-10 p-4 bg-status-danger/10 text-status-danger rounded-lg border border-status-danger/20 text-sm font-medium">
                    <ul class="list-disc pl-5 space-y-1">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Package Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
                @forelse($packages as $package)
                    <div class="relative card-hover p-8 flex flex-col {{ $package->is_featured ? 'border-2 border-brand-primary shadow-lg' : '' }}">
                        @if($package->is_featured)
                            <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                                Paling Laris
                            </span>
                        @endif

                        <h3 class="font-display text-xl font-bold text-txt-main mb-1">{{ $package->name }}</h3>
                        @if($package->tagline)
                            <p class="text-sm text-txt-muted mb-6">{{ $package->tagline }}</p>
                        @endif

                        <div class="mb-6">
                            @if($package->strike_price)
                                <span class="text-sm text-txt-muted line-through mr-2">{{ $package->formatted_strike_price }}</span>
                            @endif
                            <div class="font-display text-3xl font-bold text-txt-main">{{ $package->formatted_price }}</div>
                        </div>

                        @if($package->features)
                            <ul class="space-y-3 mb-8 flex-1">
                                @foreach($package->features as $feature)
                                    <li class="flex items-start gap-2 text-sm text-txt-muted">
                                        <svg class="w-5 h-5 text-status-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                        <span>{{ $feature }}</span>
                                    </li>
                                @endforeach
                            </ul>
                        @endif

                        <button
                            type="button"
                            @click="selected = {{ $package->id }}; $nextTick(() => $refs['form-{{ $package->id }}'].scrollIntoView({ behavior: 'smooth', block: 'center' }))"
                            :class="selected === {{ $package->id }} ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white'"
                            class="w-full font-semibold py-3 rounded-xl transition-colors">
                            Pesan Paket Ini
                        </button>
                    </div>
                @empty
                    <p class="text-center text-txt-muted col-span-3">Paket belum tersedia saat ini.</p>
                @endforelse
            </div>

            <!-- Inline Checkout Form (per package, toggled by selection) -->
            @foreach($packages as $package)
                <div x-show="selected === {{ $package->id }}" x-cloak x-ref="form-{{ $package->id }}"
                    x-transition
                    class="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-border-minimal shadow-sm mb-10">
                    <h3 class="font-display font-bold text-2xl text-txt-main mb-2">Pesan: {{ $package->name }}</h3>
                    <p class="text-sm text-txt-muted mb-8">Total pembayaran <strong>{{ $package->formatted_price }}</strong>. Anda akan diarahkan ke halaman pembayaran resmi Xendit.</p>

                    <form action="{{ route('packages.checkout', $package->slug) }}" method="POST" class="space-y-5">
                        @csrf
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Nama Lengkap / Nama Usaha</label>
                            <input type="text" name="guest_name" value="{{ old('guest_name') }}" required
                                class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main"
                                placeholder="Toko Berkah Jaya">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Email</label>
                            <input type="email" name="guest_email" value="{{ old('guest_email') }}" required
                                class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main"
                                placeholder="usaha@email.com">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Nomor WhatsApp</label>
                            <input type="text" name="guest_phone" value="{{ old('guest_phone') }}" required
                                class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main"
                                placeholder="0812xxxxxxx">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Catatan Proyek (opsional)</label>
                            <textarea name="project_brief" rows="3"
                                class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main resize-none"
                                placeholder="Ceritakan sedikit tentang usaha Anda...">{{ old('project_brief') }}</textarea>
                        </div>
                        <button type="submit" class="w-full bg-brand-primary text-white font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/30">
                            Lanjut ke Pembayaran
                        </button>
                    </form>
                </div>
            @endforeach

        </div>
    </div>
</x-layouts.app>
