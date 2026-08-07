<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Analytics & Visitor Log</h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div class="card p-5">
            <p class="text-sm text-txt-muted">Visitor Hari Ini</p>
            <p class="text-3xl font-display font-bold text-txt-main mt-1">{{ $today }}</p>
        </div>
        <div class="card p-5">
            <p class="text-sm text-txt-muted">Human Visits</p>
            <p class="text-3xl font-display font-bold text-txt-main mt-1">{{ $humans }}</p>
        </div>
        <div class="card p-5">
            <p class="text-sm text-txt-muted">Bot Visits</p>
            <p class="text-3xl font-display font-bold text-txt-main mt-1">{{ $bots }}</p>
        </div>
        <div class="card p-5">
            <p class="text-sm text-txt-muted">Total Logs</p>
            <p class="text-3xl font-display font-bold text-txt-main mt-1">{{ $total }}</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card p-6">
            <h3 class="font-display font-bold text-lg text-txt-main mb-4">Halaman Terpopuler</h3>
            <div class="space-y-2">
                @forelse ($topPages as $page)
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-txt-main truncate">{{ $page->path ?: '/' }}</span>
                        <span class="text-txt-muted font-semibold">{{ $page->hits }}</span>
                    </div>
                @empty
                    <p class="text-txt-muted text-sm">Belum ada data.</p>
                @endforelse
            </div>
        </div>

        <div class="card p-6">
            <h3 class="font-display font-bold text-lg text-txt-main mb-4">Kunjungan Terbaru</h3>
            <div class="space-y-2 max-h-80 overflow-y-auto">
                @forelse ($recent as $log)
                    <div class="text-sm border-b border-border-minimal pb-2">
                        <div class="flex items-center justify-between">
                            <span class="text-txt-main font-medium truncate">{{ $log->path ?: '/' }}</span>
                            <span class="text-txt-muted text-xs">{{ $log->visited_at?->format('d M H:i') }}</span>
                        </div>
                        <p class="text-txt-muted text-xs truncate">
                            {{ $log->is_bot ? '🤖 Bot' : '👤 Human' }}
                            @if($log->user) · {{ $log->user->name }} @endif
                            · {{ $log->ip }}
                        </p>
                    </div>
                @empty
                    <p class="text-txt-muted text-sm">Belum ada data.</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
