<div class="space-y-6">
    <div class="flex justify-between items-center border-b border-border-minimal pb-4">
        <div>
            <h2 class="text-3xl font-display font-bold text-txt-main">Aplikasi Terintegrasi (API Clients)</h2>
            <p class="text-txt-muted text-sm mt-1">Kelola aplikasi yang terhubung ke Logikraf Payment Hub.</p>
        </div>
    </div>

    <div class="bg-canvas-card rounded-2xl border border-border-minimal p-6">
        <form wire:submit="create" class="flex gap-4 items-end">
            <div class="flex-1">
                <label class="block text-sm font-medium text-txt-main mb-1">Nama Aplikasi</label>
                <input type="text" wire:model="name" class="input" placeholder="e.g., SB Digital" required>
            </div>
            <div class="flex-1">
                <label class="block text-sm font-medium text-txt-main mb-1">Webhook URL</label>
                <input type="url" wire:model="webhook_url" class="input" placeholder="https://sbdigital.id/api/webhooks/logikraf">
            </div>
            <div>
                <button type="submit" class="btn-primary">Generate API Key</button>
            </div>
        </form>
    </div>

    <div class="bg-canvas-card rounded-2xl border border-border-minimal overflow-hidden">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-canvas-light border-b border-border-minimal">
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Aplikasi</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">API Key</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Webhook</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Sub-Akun</th>
                    <th class="px-6 py-4 text-xs font-semibold text-txt-muted uppercase tracking-wider">Transaksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-minimal">
                @forelse($apps as $app)
                    <tr class="hover:bg-canvas-light/50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="font-medium text-txt-main">{{ $app->name }}</div>
                            <div class="text-xs text-txt-muted">Aktif</div>
                        </td>
                        <td class="px-6 py-4">
                            <code class="px-2 py-1 bg-gray-100 text-gray-800 rounded font-mono text-sm">
                                {{ $app->api_key }}
                            </code>
                        </td>
                        <td class="px-6 py-4 text-sm text-txt-muted">
                            {{ $app->webhook_url ?? '-' }}
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {{ $app->sub_accounts_count }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {{ $app->transactions_count }}
                            </span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-txt-muted">Belum ada aplikasi yang didaftarkan.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    <div class="mt-4">
        {{ $apps->links() }}
    </div>
</div>