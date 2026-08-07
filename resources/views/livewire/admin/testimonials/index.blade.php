<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Testimonial</h2>
        <a href="{{ route('admin.testimonials.create') }}" class="btn-primary text-sm !py-2.5 !px-5">+ Tambah</a>
    </div>

    <div class="card overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 text-txt-muted">
                <tr>
                    <th class="text-left p-4 font-medium">Klien</th>
                    <th class="text-left p-4 font-medium">Perusahaan</th>
                    <th class="text-left p-4 font-medium">Konten</th>
                    <th class="text-left p-4 font-medium">Status</th>
                    <th class="text-right p-4 font-medium">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-minimal">
                @forelse ($testimonials as $t)
                    <tr>
                        <td class="p-4">{{ $t->client_name }}</td>
                        <td class="p-4">{{ $t->company ?: '-' }}</td>
                        <td class="p-4 max-w-xs truncate">{{ Str::limit($t->content, 50) }}</td>
                        <td class="p-4">
                            @if($t->is_approved)<span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Approved</span>@else<span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">Pending</span>@endif
                            @if($t->is_featured)<span class="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 ml-1">Featured</span>@endif
                        </td>
                        <td class="p-4 text-right">
                            <a href="{{ route('admin.testimonials.edit', $t) }}" class="text-brand-primary hover:underline">Edit</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="p-8 text-center text-txt-muted">Belum ada testimonial.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $testimonials->links() }}</div>
</div>
