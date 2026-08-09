<div class="pt-32 pb-20 bg-canvas-light min-h-screen">
    <div class="container-narrow">
        <div class="text-center max-w-2xl mx-auto mb-16">
            <h1 class="text-4xl font-display font-bold text-txt-main mb-4">Blog & Berita</h1>
            <p class="text-txt-muted text-sm leading-relaxed">Wawasan, tips, dan kabar terbaru dari tim Logikraf.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @forelse ($posts as $post)
                <a href="{{ route('blog.show', $post) }}" class="card overflow-hidden hover:shadow-lg transition-shadow group">
                    @if ($post->featured_image)
                        <img src="{{ $post->featured_image_url }}" alt="{{ $post->title }}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                    @else
                        <div class="w-full h-48 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20"></div>
                    @endif
                    <div class="p-6">
                        <span class="text-xs text-brand-primary font-semibold">{{ $post->published_at?->format('d M Y') }}</span>
                        <h3 class="font-display font-bold text-lg text-txt-main mt-2 mb-2 group-hover:text-brand-primary transition-colors">{{ $post->title }}</h3>
                        <p class="text-sm text-txt-muted line-clamp-3">{{ $post->excerpt }}</p>
                    </div>
                </a>
            @empty
                <p class="text-txt-muted col-span-full text-center">Belum ada artikel.</p>
            @endforelse
        </div>

        {{ $posts->links() }}
    </div>
</div>
