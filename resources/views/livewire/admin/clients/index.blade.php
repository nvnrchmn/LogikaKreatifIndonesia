<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">Client CRM</h2>
        <a href="{{ route('admin.clients.create') }}" class="btn-primary text-sm !py-2.5 !px-5">+ Tambah Client</a>
    </div>

    <div class="card overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 text-txt-muted">
                <tr>
                    <th class="text-left p-4 font-medium">Perusahaan</th>
                    <th class="text-left p-4 font-medium">PIC</th>
                    <th class="text-left p-4 font-medium">Email</th>
                    <th class="text-left p-4 font-medium">Phone</th>
                    <th class="text-left p-4 font-medium">Kota</th>
                    <th class="text-right p-4 font-medium">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-minimal">
                @forelse ($clients as $c)
                    <tr>
                        <td class="p-4">{{ $c->company_name ?: '-' }}</td>
                        <td class="p-4">{{ $c->pic_name }}</td>
                        <td class="p-4">{{ $c->email ?: '-' }}</td>
                        <td class="p-4">{{ $c->phone ?: '-' }}</td>
                        <td class="p-4">{{ $c->city ?: '-' }}</td>
                        <td class="p-4 text-right">
                            <a href="{{ route('admin.clients.edit', $c) }}" class="text-brand-primary hover:underline">Edit</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="p-8 text-center text-txt-muted">Belum ada client.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $clients->links() }}</div>
</div>
