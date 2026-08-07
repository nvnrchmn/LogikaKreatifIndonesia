<x-layouts.app>
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen">
        <div class="container-narrow max-w-3xl">
            <a href="{{ route('blog.index') }}" class="text-txt-muted text-sm mb-8 inline-block">← Kembali ke Blog</a>

            @if ($post->featured_image)
                <img src="{{ $post->featured_image }}" alt="{{ $post->title }}" class="w-full h-64 object-cover rounded-2xl mb-8">
            @endif

            <span class="text-xs text-brand-primary font-semibold">{{ $post->published_at?->format('d M Y') }}</span>
            <h1 class="text-4xl font-display font-bold text-txt-main mt-2 mb-6">{{ $post->title }}</h1>

            @if ($post->excerpt)
                <p class="text-lg text-txt-muted mb-8 leading-relaxed">{{ $post->excerpt }}</p>
            @endif

            <article class="prose max-w-none text-txt-main leading-relaxed">
                {!! nl2br(e($post->body)) !!}
            </article>
        </div>
    </div>
</x-layouts.app>
