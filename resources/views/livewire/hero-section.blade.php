<section id="beranda" class="relative min-h-[90vh] flex items-center bg-canvas-dark overflow-hidden">
    <!-- Radial Gradient Background -->
    <div class="absolute inset-0 gradient-radial-hero"></div>

    <!-- Animated Grid Pattern -->
    <div class="absolute inset-0 opacity-[0.03]"
         style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 60px 60px;">
    </div>

    <!-- Floating Orbs -->
    <div class="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-1/4 left-1/3 w-96 h-96 bg-brand-accent/5 rounded-full blur-[150px] animate-pulse" style="animation-delay: 2s;"></div>

    <div class="container-narrow relative z-10 py-20">
        <div class="max-w-4xl">
            <!-- Badge -->
            <div class="animate-fade-in mb-8">
                <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 font-body text-xs font-medium tracking-wide">
                    <span class="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                    Software House & IT Solutions
                </span>
            </div>

            <!-- Headline -->
            <h1 class="animate-slide-up font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8" style="animation-delay: 0.1s;">
                {{ $headline }}
            </h1>

            <!-- Sub-headline -->
            <p class="animate-slide-up font-body text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mb-12" style="animation-delay: 0.2s;">
                {{ $subheadline }}
            </p>

            <!-- CTA Buttons -->
            <div class="animate-slide-up flex flex-col sm:flex-row items-start gap-4" style="animation-delay: 0.3s;">
                <a href="#konsultasi" class="btn-primary text-base !py-4 !px-8 shadow-lg shadow-brand-primary/25">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Mulai Proyek Anda
                </a>
                <a href="#portofolio" class="btn-secondary !border-white/20 !text-white/80 hover:!bg-white/10 hover:!text-white hover:!border-white/30 text-base !py-4 !px-8">
                    Lihat Portofolio
                </a>
            </div>

            <!-- Stats Row -->
            <div class="animate-fade-in mt-20 flex flex-wrap items-center gap-x-12 gap-y-6" style="animation-delay: 0.5s;">
                <div>
                    <span class="block font-display text-3xl font-bold text-white">50+</span>
                    <span class="font-body text-sm text-white/40">Proyek Selesai</span>
                </div>
                <div class="w-px h-10 bg-white/10 hidden sm:block"></div>
                <div>
                    <span class="block font-display text-3xl font-bold text-white">30+</span>
                    <span class="font-body text-sm text-white/40">Klien Terpercaya</span>
                </div>
                <div class="w-px h-10 bg-white/10 hidden sm:block"></div>
                <div>
                    <span class="block font-display text-3xl font-bold text-white">4</span>
                    <span class="font-body text-sm text-white/40">Layanan Utama</span>
                </div>
                <div class="w-px h-10 bg-white/10 hidden sm:block"></div>
                <div>
                    <span class="block font-display text-3xl font-bold text-brand-accent">99%</span>
                    <span class="font-body text-sm text-white/40">Kepuasan Klien</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Gradient Fade -->
    <div class="absolute bottom-0 left-0 right-0 h-32 gradient-dark-bottom"></div>
</section>
