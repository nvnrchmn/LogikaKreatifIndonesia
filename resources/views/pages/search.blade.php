<x-layouts.app>
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen">
        <div class="container-narrow">
            <h1 class="text-4xl font-display font-bold text-txt-main mb-6">Pencarian</h1>

            <form action="{{ route('search') }}" method="GET" class="mb-10">
                <div class="flex gap-3">
                    <input type="text" name="q" value="{{ $q }}" placeholder="Cari artikel, layanan, portofolio..." class="flex-1 px-4 py-3 bg-white border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-txt-main" autofocus>
                    <button type="submit" class="bg-brand-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-primary/90 transition-colors">Cari</button>
                </div>
            </form>

            @if ($q)
                <p class="text-txt-muted text-sm mb-8">
                    @if ($total > 0)
                        {{ $total }} hasil untuk "<span class="font-semibold text-txt-main">{{ $q }}</span>"
                    @else
                        Tidak ada hasil untuk "<span class="font-semibold text-txt-main">{{ $q }}</span>"
                    @endif
                </p>

                @if (count($results['posts']) > 0)
                    <section class="mb-10">
                        <h2 class="text-xl font-display font-bold text-txt-main mb-4">Artikel</h2>
                        <div class="space-y-3">
                            @foreach ($results['posts'] as $post)
                                <a href="{{ route('blog.show', $post) }}" class="block card p-5 hover:shadow-lg transition-shadow">
                                    <h3 class="font-semibold text-txt-main group-hover:text-brand-primary">{{ $post->title }}</h3>
                                    @if ($post->excerpt)
                                        <p class="text-sm text-txt-muted mt-1 line-clamp-2">{{ $post->excerpt }}</p>
                                    @endif
                                </a>
                            @endforeach
                        </div>
                    </section>
                @endif

                @if (count($results['services']) > 0)
                    <section class="mb-10">
                        <h2 class="text-xl font-display font-bold text-txt-main mb-4">Layanan</h2>
                        <div class="space-y-3">
                            @foreach ($results['services'] as $service)
                                <a href="{{ route('services.index') }}" class="block card p-5 hover:shadow-lg transition-shadow">
                                    <h3 class="font-semibold text-txt-main">{{ $service->name }}</h3>
                                    <p class="text-sm text-txt-muted mt-1 line-clamp-2">{{ Str::limit($service->description, 120) }}</p>
                                </a>
                            @endforeach
                        </div>
                    </section>
                @endif

                @if (count($results['portfolios']) > 0)
                    <section class="mb-10">
                        <h2 class="text-xl font-display font-bold text-txt-main mb-4">Portofolio</h2>
                        <div class="space-y-3">
                            @foreach ($results['portfolios'] as $portfolio)
                                <a href="{{ route('portfolios.index') }}" class="block card p-5 hover:shadow-lg transition-shadow">
                                    <h3 class="font-semibold text-txt-main">{{ $portfolio->title }}</h3>
                                    <p class="text-sm text-txt-muted mt-1">{{ $portfolio->client_name }}</p>
                                </a>
                            @endforeach
                        </div>
                    </section>
                @endif
            @else
                <p class="text-txt-muted">Masukkan kata kunci minimal 2 karakter untuk mencari.</p>
            @endif
        </div>
    </div>
</x-layouts.app>
