<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Daftar Artikel</h2>
        <a href="{{ route('admin.blog.create') }}" class="bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-primary/90">Tulis Baru</a>
    </div>

    @if (session('message'))
        <div class="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3 text-sm mb-4">{{ session('message') }}</div>
    @endif

    <div class="card overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="text-left text-txt-muted border-b border-border-minimal">
                    <th class="p-4">Judul</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Tanggal</th>
                    <th class="p-4"></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($posts as $post)
                    <tr class="border-b border-border-minimal">
                        <td class="p-4 font-medium text-txt-main">{{ $post->title }}</td>
                        <td class="p-4">
                            @if ($post->is_published)
                                <span class="text-green-600 text-xs font-semibold">Published</span>
                            @else
                                <span class="text-gray-400 text-xs font-semibold">Draft</span>
                            @endif
                        </td>
                        <td class="p-4 text-txt-muted">{{ $post->published_at?->format('d M Y') ?? '-' }}</td>
                        <td class="p-4 text-right">
                            <a href="{{ route('admin.blog.edit', $post) }}" class="text-brand-primary text-xs font-semibold mr-3">Edit</a>
                            <button wire:click="delete({{ $post->id }})" wire:confirm="Hapus artikel ini?" class="text-red-500 text-xs font-semibold">Hapus</button>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="p-4 text-center text-txt-muted">Belum ada artikel.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{ $posts->links() }}
</div>
