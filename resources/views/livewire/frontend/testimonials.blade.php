<div>
@if ($testimonials->isNotEmpty())
<section class="py-20 bg-canvas-light">
    <div class="container-narrow">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-display font-bold text-txt-main">Apa Kata Klien Kami</h2>
            <p class="text-txt-muted mt-2">Kepercayaan mereka adalah motivasi kami.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach ($testimonials as $t)
                <div class="card p-6">
                    <p class="text-txt-main/90 text-sm leading-relaxed mb-5">"{{ $t->content }}"</p>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                            {{ strtoupper(substr($t->client_name, 0, 1)) }}
                        </div>
                        <div>
                            <p class="font-semibold text-txt-main text-sm">{{ $t->client_name }}</p>
                            <p class="text-txt-muted text-xs">{{ $t->position ? $t->position . ' · ' : '' }}{{ $t->company }}</p>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif
</div>
