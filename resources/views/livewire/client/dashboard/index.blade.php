<div>
    <div class="mb-8">
        <h2 class="font-display text-2xl font-bold text-txt-main">Halo, {{ auth()->user()->name }}!</h2>
        <p class="text-txt-muted text-sm mt-1">Selamat datang di Client Portal Logika Kreatif Indonesia.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Orders -->
        <div class="bg-white rounded-xl border border-border-minimal p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                </div>
            </div>
            <div>
                <h3 class="font-display font-bold text-3xl text-txt-main mb-1">{{ $stats['total_orders'] }}</h3>
                <p class="text-sm text-txt-muted font-medium">Total Orders</p>
            </div>
        </div>

        <!-- Active Projects -->
        <div class="bg-white rounded-xl border border-border-minimal p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-brand-accent/5 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
            </div>
            <div>
                <h3 class="font-display font-bold text-3xl text-txt-main mb-1">{{ $stats['active_projects'] }}</h3>
                <p class="text-sm text-txt-muted font-medium">Active Projects</p>
            </div>
        </div>

        <!-- Completed Projects -->
        <div class="bg-white rounded-xl border border-border-minimal p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-status-success/5 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-lg bg-status-success/10 flex items-center justify-center text-status-success">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
            </div>
            <div>
                <h3 class="font-display font-bold text-3xl text-txt-main mb-1">{{ $stats['completed_projects'] }}</h3>
                <p class="text-sm text-txt-muted font-medium">Completed Projects</p>
            </div>
        </div>

        <!-- Total Spent -->
        <div class="bg-white rounded-xl border border-border-minimal p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-status-warning/5 transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-lg bg-status-warning/10 flex items-center justify-center text-status-warning">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
            </div>
            <div>
                <h3 class="font-display font-bold text-xl text-txt-main mb-1">Rp {{ number_format($stats['total_spent'], 0, ',', '.') }}</h3>
                <p class="text-sm text-txt-muted font-medium">Total Estimasi Nilai</p>
            </div>
        </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white border border-border-minimal rounded-xl overflow-hidden shadow-sm">
        <div class="p-5 border-b border-border-minimal flex items-center justify-between">
            <h3 class="font-display font-semibold text-txt-main">Proyek Terbaru</h3>
            <a href="{{ route('client.orders.index') }}" class="text-sm text-brand-primary font-medium hover:underline">Lihat Semua</a>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-canvas-light text-txt-muted text-xs uppercase tracking-wider">
                        <th class="px-6 py-4 font-medium">Order & Proyek</th>
                        <th class="px-6 py-4 font-medium">Layanan</th>
                        <th class="px-6 py-4 font-medium">Nilai Proyek</th>
                        <th class="px-6 py-4 font-medium">Status</th>
                        <th class="px-6 py-4 font-medium">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border-minimal">
                    @forelse($recentOrders as $order)
                        <tr class="hover:bg-canvas-light/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $order->project_name }}</div>
                                <div class="font-body text-xs text-txt-muted mt-1">{{ $order->order_number }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm text-txt-main">{{ $order->service->name ?? '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-body text-sm font-bold text-txt-main">{{ $order->formatted_amount }}</div>
                            </td>
                            <td class="px-6 py-4">
                                @if($order->status === 'completed')
                                    <span class="badge bg-status-success/10 text-status-success">Selesai</span>
                                @elseif($order->status === 'cancelled')
                                    <span class="badge bg-status-danger/10 text-status-danger">Dibatalkan</span>
                                @elseif($order->status === 'in_progress')
                                    <span class="badge bg-brand-accent/10 text-brand-accent">Dalam Pengerjaan</span>
                                @else
                                    <span class="badge bg-status-warning/10 text-status-warning">Pending</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <a href="{{ route('client.orders.show', $order) }}" class="btn bg-brand-primary text-white text-xs px-3 py-1.5 hover:bg-brand-primary/90">Lihat Detail & Tagihan</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-txt-muted text-sm">
                                Belum ada order proyek saat ini.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
