<section id="portofolio" class="section-padding bg-canvas-overlay">
    <div class="container-narrow">
        <!-- Section Header -->
        <div class="text-center mb-12 lg:mb-16">
            <span class="badge-primary mb-4">Portofolio</span>
            <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-txt-main mb-6">
                Proyek yang Telah <span class="text-brand-primary">Kami Wujudkan</span>
            </h2>
            <p class="font-body text-lg text-txt-muted max-w-2xl mx-auto leading-relaxed">
                Setiap proyek adalah bukti dedikasi kami dalam menghadirkan solusi digital terbaik.
            </p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-12" wire:key="filter-tabs">
            @foreach($categories as $key => $label)
                <button wire:click="setFilter('{{ $key }}')"
                        class="px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-200
                               {{ $activeFilter === $key
                                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                  : 'bg-canvas-card text-txt-muted hover:text-brand-primary border border-border-minimal hover:border-brand-primary/30' }}">
                    {{ $label }}
                </button>
            @endforeach
        </div>

        <!-- Portfolio Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" wire:loading.class="opacity-50" wire:target="setFilter">
            @forelse($portfolios as $portfolio)
                <article class="card-hover group overflow-hidden" wire:key="portfolio-{{ $portfolio->id }}">
                    <!-- Thumbnail -->
                    <div class="aspect-video bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 overflow-hidden relative">
                        @if($portfolio->thumbnail)
                            <img src="{{ $portfolio->thumbnail_url }}"
                                 alt="{{ $portfolio->title }}"
                                 class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                 loading="lazy">
                        @else
                            <div class="w-full h-full flex items-center justify-center">
                                <div class="text-center">
                                    <div class="w-12 h-12 mx-auto mb-2 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                        <svg class="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                    <span class="text-xs text-txt-muted">{{ $portfolio->service->name ?? 'Project' }}</span>
                                </div>
                            </div>
                        @endif

                        <!-- Category Badge Overlay -->
                        <div class="absolute top-3 left-3">
                            <span class="badge bg-canvas-dark/70 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider">
                                {{ $portfolio->service->category ?? 'project' }}
                            </span>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <h3 class="font-display text-lg font-bold text-txt-main mb-2 group-hover:text-brand-primary transition-colors duration-200 line-clamp-1">
                            {{ $portfolio->title }}
                        </h3>
                        <p class="font-body text-sm text-txt-muted mb-4 line-clamp-2">
                            {{ $portfolio->excerpt ?? Str::limit($portfolio->description, 100) }}
                        </p>

                        <!-- Tech Stack Tags -->
                        @if($portfolio->tech_stack && count($portfolio->tech_stack) > 0)
                            <div class="flex flex-wrap gap-1.5 mb-4">
                                @foreach(array_slice($portfolio->tech_stack, 0, 3) as $tech)
                                    <span class="px-2 py-1 bg-brand-primary/5 text-brand-primary text-[11px] font-medium rounded">
                                        {{ $tech }}
                                    </span>
                                @endforeach
                                @if(count($portfolio->tech_stack) > 3)
                                    <span class="px-2 py-1 bg-gray-100 text-txt-muted text-[11px] font-medium rounded">
                                        +{{ count($portfolio->tech_stack) - 3 }}
                                    </span>
                                @endif
                            </div>
                        @endif

                        <!-- Divider + CTA -->
                        <div class="pt-4 border-t border-border-minimal">
                            <a href="{{ route('portfolio.show', $portfolio->slug) }}"
                               class="inline-flex items-center gap-2 text-brand-primary font-body text-sm font-semibold hover:gap-3 transition-all duration-200">
                                Lihat Detail
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </article>
            @empty
                {{-- Empty state with placeholder cards --}}
                @for($i = 0; $i < 3; $i++)
                    <div class="card p-6 text-center">
                        <div class="aspect-video bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-lg mb-4 flex items-center justify-center">
                            <svg class="w-10 h-10 text-txt-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                        </div>
                        <p class="font-body text-sm text-txt-muted">Proyek portofolio akan segera ditampilkan</p>
                    </div>
                @endfor
            @endforelse
        </div>

        <!-- Loading Indicator -->
        <div wire:loading wire:target="setFilter" class="text-center mt-8">
            <div class="inline-flex items-center gap-2 text-brand-primary font-body text-sm">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Memuat...
            </div>
        </div>
    </div>
</section>
