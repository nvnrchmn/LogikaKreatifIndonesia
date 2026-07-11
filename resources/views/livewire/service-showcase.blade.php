<section id="layanan" class="section-padding bg-canvas-light">
    <div class="container-narrow">
        <!-- Section Header -->
        <div class="text-center mb-16 lg:mb-20">
            <span class="badge-primary mb-4">Layanan Kami</span>
            <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-txt-main mb-6">
                Solusi Digital yang <span class="text-brand-primary">Komprehensif</span>
            </h2>
            <p class="font-body text-lg text-txt-muted max-w-2xl mx-auto leading-relaxed">
                Empat pilar keahlian yang saling melengkapi untuk menghadirkan produk digital yang berdampak bagi bisnis Anda.
            </p>
        </div>

        <!-- Service Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            @forelse($services as $service)
                <div class="card-hover group p-8 lg:p-10">
                    <!-- Icon -->
                    <div class="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-brand-primary group-hover:scale-110">
                        <svg class="w-7 h-7 text-brand-primary transition-colors duration-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {!! $serviceIcons[$service->category] ?? '' !!}
                        </svg>
                    </div>

                    <!-- Category Badge -->
                    <span class="badge-primary text-[10px] uppercase tracking-widest mb-4">
                        {{ str_replace('uiux', 'UI/UX', $service->category) }}
                    </span>

                    <!-- Title -->
                    <h3 class="font-display text-xl lg:text-2xl font-bold text-txt-main mb-3 group-hover:text-brand-primary transition-colors duration-200">
                        {{ $service->name }}
                    </h3>

                    <!-- Description -->
                    <p class="font-body text-sm text-txt-muted leading-relaxed mb-6">
                        {{ $service->short_description ?? Str::limit($service->description, 150) }}
                    </p>

                    <!-- Base Price -->
                    @if($service->base_price > 0)
                        <div class="pt-6 border-t border-border-minimal">
                            <span class="font-body text-xs text-txt-muted">Mulai dari</span>
                            <span class="font-display text-lg font-bold text-txt-main ml-2">
                                Rp {{ number_format($service->base_price, 0, ',', '.') }}
                            </span>
                        </div>
                    @endif
                </div>
            @empty
                {{-- Placeholder cards when no services in DB --}}
                @foreach(['Software Development', 'UI/UX Design', 'Digital Marketing', 'Branding'] as $index => $name)
                    <div class="card-hover group p-8 lg:p-10">
                        <div class="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-brand-primary group-hover:scale-110">
                            <svg class="w-7 h-7 text-brand-primary transition-colors duration-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {!! $serviceIcons[['software','uiux','marketing','branding'][$index]] !!}
                            </svg>
                        </div>
                        <h3 class="font-display text-xl lg:text-2xl font-bold text-txt-main mb-3 group-hover:text-brand-primary transition-colors duration-200">
                            {{ $name }}
                        </h3>
                        <p class="font-body text-sm text-txt-muted leading-relaxed">
                            Solusi {{ strtolower($name) }} profesional untuk membantu bisnis Anda bertumbuh di era digital.
                        </p>
                    </div>
                @endforeach
            @endforelse
        </div>
    </div>
</section>
