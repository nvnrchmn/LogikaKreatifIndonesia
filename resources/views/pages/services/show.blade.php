<x-layouts.app :title="$service['title'] . ' | Logika Kreatif Indonesia'">
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen">
        <div class="container-narrow">
            <div class="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border-minimal">
                <!-- Icon & Title -->
                <div class="flex items-center gap-6 mb-8 pb-8 border-b border-border-minimal">
                    <div class="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0" style="background-color: {{ $service['color'] }}20; color: {{ $service['color'] }}">
                        {!! $service['icon'] !!}
                    </div>
                    <div>
                        <span class="text-sm font-bold tracking-wider uppercase mb-2 block" style="color: {{ $service['color'] }}">Layanan Kami</span>
                        <h1 class="text-3xl md:text-4xl font-display font-bold text-txt-main">{{ $service['title'] }}</h1>
                    </div>
                </div>

                <!-- Description -->
                <div class="prose prose-lg prose-blue max-w-none text-txt-main font-body leading-relaxed mb-12">
                    <p class="text-xl text-txt-muted">{{ $service['short_desc'] }}</p>
                    <div class="mt-8">
                        {!! $service['content'] !!}
                    </div>
                </div>

                <!-- Features -->
                <h3 class="text-2xl font-display font-bold text-txt-main mb-6">Apa yang Anda Dapatkan?</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    @foreach($service['features'] as $feature)
                        <div class="flex items-start gap-3 bg-canvas-light p-4 rounded-xl">
                            <svg class="w-6 h-6 shrink-0 mt-0.5" style="color: {{ $service['color'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span class="font-body text-txt-main">{{ $feature }}</span>
                        </div>
                    @endforeach
                </div>

                <!-- CTA -->
                <div class="bg-txt-main text-white rounded-2xl p-8 text-center mt-12 relative overflow-hidden group">
                    <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at center, {{ $service['color'] }} 0%, transparent 70%);"></div>
                    <div class="relative z-10">
                        <h4 class="text-2xl font-display font-bold mb-4">Siap untuk Memulai?</h4>
                        <p class="text-white/70 mb-8 max-w-lg mx-auto">Konsultasikan kebutuhan {{ $service['title'] }} Anda bersama tim ahli kami hari ini.</p>
                        <a href="{{ route('contact') }}" class="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl" style="background-color: {{ $service['color'] }}; color: white; shadow-color: {{ $service['color'] }}40;">
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-layouts.app>
