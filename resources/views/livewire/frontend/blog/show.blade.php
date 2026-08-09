<div class="pt-32 pb-20 bg-canvas-light min-h-screen">
    <div class="container-narrow max-w-3xl">
        <a href="{{ route('blog.index') }}" class="text-txt-muted text-sm mb-8 inline-block hover:text-brand-primary transition-colors">&larr; Kembali ke Blog</a>

        @if ($post->featured_image)
            <img src="{{ $post->featured_image }}" alt="{{ $post->title }}" class="w-full h-72 object-cover rounded-3xl mb-8 shadow-sm">
        @endif

        <div class="flex items-center gap-3 mb-4">
            <span class="text-xs text-brand-primary font-semibold">{{ $post->published_at?->format('d M Y') }}</span>
            <span class="text-txt-muted text-xs">&bull;</span>
            <span class="text-xs text-txt-muted">{{ $this->readingTime() }} menit baca</span>
        </div>

        <h1 class="text-4xl md:text-5xl font-display font-bold text-txt-main mt-2 mb-6 leading-tight">{{ $post->title }}</h1>

        @if ($post->author)
            <div class="flex items-center gap-3 mb-8 pb-8 border-b border-brand-primary/10">
                <div class="w-10 h-10 rounded-full bg-brand-primary/15 flex items-center justify-center text-brand-primary font-semibold text-sm">
                    {{ substr($post->author->name, 0, 1) }}
                </div>
                <div>
                    <p class="text-sm font-semibold text-txt-main">{{ $post->author->name }}</p>
                    <p class="text-xs text-txt-muted">Penulis</p>
                </div>
            </div>
        @endif

        @if ($post->excerpt)
            <p class="text-lg text-txt-muted mb-8 leading-relaxed font-medium">{{ $post->excerpt }}</p>
        @endif

        <article class="prose max-w-none text-txt-main leading-relaxed prose-headings:font-display prose-a:text-brand-primary">
            {!! nl2br(e($post->body)) !!}
        </article>

        <div class="mt-12 pt-8 border-t border-brand-primary/10 flex items-center gap-3">
            <span class="text-sm text-txt-muted">Bagikan:</span>
            <a href="https://twitter.com/intent/tweet?url={{ urlencode(url()->current()) }}&text={{ urlencode($post->title) }}"
               target="_blank" rel="noopener" class="text-txt-muted hover:text-brand-primary transition-colors text-sm">Twitter</a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlencode(url()->current()) }}"
               target="_blank" rel="noopener" class="text-txt-muted hover:text-brand-primary transition-colors text-sm">LinkedIn</a>
            <a href="https://wa.me/?text={{ urlencode($post->title . ' ' . url()->current()) }}"
               target="_blank" rel="noopener" class="text-txt-muted hover:text-brand-primary transition-colors text-sm">WhatsApp</a>
        </div>
    </div>

    @if ($related->isNotEmpty())
        <div class="container-narrow max-w-5xl mt-16">
            <h2 class="text-2xl font-display font-bold text-txt-main mb-8">Baca Juga</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @foreach ($related as $r)
                    <a href="{{ route('blog.show', $r) }}" class="card overflow-hidden hover:shadow-lg transition-shadow group">
                        @if ($r->featured_image)
                            <img src="{{ $r->featured_image }}" alt="{{ $r->title }}" class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300">
                        @else
                            <div class="w-full h-40 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20"></div>
                        @endif
                        <div class="p-5">
                            <span class="text-xs text-brand-primary font-semibold">{{ $r->published_at?->format('d M Y') }}</span>
                            <h3 class="font-display font-bold text-txt-main mt-2 group-hover:text-brand-primary transition-colors">{{ $r->title }}</h3>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    @endif
</div>
