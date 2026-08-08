<div>
    <div class="mb-6">
        <h1 class="font-display text-2xl font-bold text-txt-main">Time Tracking</h1>
        <p class="text-txt-muted text-sm mt-1">Catat jam kerja per order / task untuk billing & efisiensi.</p>
    </div>

    @if (session('success'))
        <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif
    @if (session('error'))
        <div class="mb-6 p-4 bg-status-error/10 text-status-error rounded-lg border border-status-error/20 text-sm font-medium">
            {{ session('error') }}
        </div>
    @endif

    <!-- Form -->
    <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm mb-6 max-w-3xl">
        <h3 class="font-display font-semibold text-lg text-txt-main mb-4 border-b border-border-minimal pb-2">Tambah Time Entry</h3>
        <form wire:submit="save" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Order *</label>
                    <select wire:model.live="order_id" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-txt-main">
                        <option value="">-- Pilih Order --</option>
                        @foreach ($orders as $o)
                            <option value="{{ $o->id }}">#{{ $o->id }} — {{ $o->project_name ?? ('Order '.$o->id) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Task (opsional)</label>
                    <select wire:model="order_task_id" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-txt-main">
                        <option value="">-- Umum (tanpa task) --</option>
                        @foreach ($tasks as $t)
                            <option value="{{ $t->id }}">{{ $t->title }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-semibold text-txt-main mb-2">Deskripsi</label>
                <input wire:model="description" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-txt-main" placeholder="Misal: implementasi API login">
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Jam</label>
                    <input wire:model="hours" type="number" min="0" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-txt-main">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Menit</label>
                    <input wire:model="minutes" type="number" min="0" max="59" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-txt-main">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Tanggal</label>
                    <input wire:model="worked_date" type="date" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-txt-main">
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors">
                    Simpan Time Entry
                </button>
            </div>
        </form>
    </div>

    <!-- Summary + List -->
    <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-display font-semibold text-lg text-txt-main">Riwayat Time Entry</h3>
            <span class="text-sm text-txt-muted">Total: <strong class="text-txt-main">{{ intdiv($totalMinutes, 60) }}j {{ $totalMinutes % 60 }}m</strong></span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 text-txt-muted">
                    <tr>
                        <th class="text-left p-3 font-medium">Tanggal</th>
                        <th class="text-left p-3 font-medium">Order</th>
                        <th class="text-left p-3 font-medium">Task</th>
                        <th class="text-left p-3 font-medium">Deskripsi</th>
                        <th class="text-left p-3 font-medium">Durasi</th>
                        <th class="text-right p-3 font-medium">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse ($entries as $e)
                        <tr>
                            <td class="p-3">{{ $e->worked_date?->format('d M Y') ?? '-' }}</td>
                            <td class="p-3">#{{ $e->order_id }}</td>
                            <td class="p-3">{{ $e->task?->title ?? '-' }}</td>
                            <td class="p-3">{{ Str::limit($e->description, 40) ?? '-' }}</td>
                            <td class="p-3 font-semibold">{{ $e->formatted_duration }}</td>
                            <td class="p-3 text-right">
                                <button wire:click="deleteEntry({{ $e->id }})" wire:confirm="Hapus time entry ini?" class="text-red-600 hover:underline">Hapus</button>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="p-6 text-center text-txt-muted">Belum ada time entry.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-4">
            {{ $entries->links() }}
        </div>
    </div>
</div>
