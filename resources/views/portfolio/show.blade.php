<x-layouts.app
    :title="$portfolio->title . ' — Logika Kreatif Indonesia'"
    :metaDescription="$portfolio->excerpt ?? Str::limit($portfolio->description, 160)">

    {{-- Back Navigation --}}
    <section class="bg-canvas-dark pt-28 pb-12">
        <div class="container-narrow">
            <a href="/#portofolio" class="inline-flex items-center gap-2 text-white/50 hover:text-white font-body text-sm transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Kembali ke Portofolio
            </a>
        </div>
    </section>

    {{-- Portfolio Hero --}}
    <section class="bg-canvas-dark pb-20">
        <div class="container-narrow">
            <div class="max-w-4xl">
                <span class="badge bg-brand-primary/10 text-brand-primary mb-6">
                    {{ $portfolio->service->name ?? 'Project' }}
                </span>
                <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                    {{ $portfolio->title }}
                </h1>
                <p class="font-body text-lg text-white/50 leading-relaxed max-w-2xl mb-8">
                    {{ $portfolio->excerpt ?? Str::limit($portfolio->description, 200) }}
                </p>

                <div class="flex flex-wrap items-center gap-6 text-white/40 font-body text-sm">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        {{ $portfolio->client_name }}
                    </div>
                    @if($portfolio->completed_at)
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {{ $portfolio->completed_at->translatedFormat('F Y') }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </section>

    {{-- Tech Stack --}}
    @if($portfolio->tech_stack && count($portfolio->tech_stack) > 0)
        <section class="py-8 border-b border-border-minimal bg-canvas-light">
            <div class="container-narrow">
                <div class="flex flex-wrap items-center gap-3">
                    <span class="font-body text-sm font-medium text-txt-muted mr-2">Built with:</span>
                    @foreach($portfolio->tech_stack as $tech)
                        <span class="badge-primary">{{ $tech }}</span>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    {{-- Main Content --}}
    <section class="section-padding bg-canvas-light">
        <div class="container-narrow">
            <div class="max-w-4xl mx-auto">
                {{-- Description --}}
                <div class="prose prose-lg max-w-none font-body text-txt-main leading-relaxed mb-16">
                    {!! nl2br(e($portfolio->description)) !!}
                </div>

                {{-- Challenge / Solution / Result --}}
                @if($portfolio->challenge || $portfolio->solution || $portfolio->result)
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        @if($portfolio->challenge)
                            <div class="card p-8">
                                <div class="w-10 h-10 rounded-lg bg-status-warning/10 flex items-center justify-center mb-4">
                                    <svg class="w-5 h-5 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                    </svg>
                                </div>
                                <h3 class="font-display text-lg font-bold text-txt-main mb-3">Tantangan</h3>
                                <p class="font-body text-sm text-txt-muted leading-relaxed">{{ $portfolio->challenge }}</p>
                            </div>
                        @endif

                        @if($portfolio->solution)
                            <div class="card p-8">
                                <div class="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4">
                                    <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                    </svg>
                                </div>
                                <h3 class="font-display text-lg font-bold text-txt-main mb-3">Solusi</h3>
                                <p class="font-body text-sm text-txt-muted leading-relaxed">{{ $portfolio->solution }}</p>
                            </div>
                        @endif

                        @if($portfolio->result)
                            <div class="card p-8">
                                <div class="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center mb-4">
                                    <svg class="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h3 class="font-display text-lg font-bold text-txt-main mb-3">Hasil</h3>
                                <p class="font-body text-sm text-txt-muted leading-relaxed">{{ $portfolio->result }}</p>
                            </div>
                        @endif
                    </div>
                @endif

                {{-- Project URL --}}
                @if($portfolio->project_url)
                    <div class="mt-12 text-center">
                        <a href="{{ $portfolio->project_url }}" target="_blank" rel="noopener noreferrer"
                           class="btn-primary text-base !py-4 !px-8">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                            Kunjungi Website
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </section>

    {{-- CTA Section --}}
    <section class="py-20 bg-brand-primary">
        <div class="container-narrow text-center">
            <h2 class="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Punya Proyek Serupa?
            </h2>
            <p class="font-body text-lg text-white/70 mb-8 max-w-xl mx-auto">
                Diskusikan kebutuhan Anda bersama tim kami dan dapatkan estimasi proyek dalam 24 jam.
            </p>
            <a href="/#konsultasi" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-primary font-display font-bold rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg">
                Mulai Konsultasi
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
            </a>
        </div>
    </section>
</x-layouts.app>
