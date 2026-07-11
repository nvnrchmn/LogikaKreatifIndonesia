<div>
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Leads -->
        <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                @if($stats['new_leads'] > 0)
                    <span class="badge-accent text-[10px]">{{ $stats['new_leads'] }} baru</span>
                @endif
            </div>
            <p class="font-display text-2xl font-bold text-txt-main">{{ $stats['total_leads'] }}</p>
            <p class="font-body text-xs text-txt-muted mt-1">Total Leads Masuk</p>
        </div>

        <!-- Active Orders -->
        <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-lg bg-status-warning/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <span class="text-xs font-medium text-txt-muted">{{ $stats['total_orders'] }} total</span>
            </div>
            <p class="font-display text-2xl font-bold text-txt-main">{{ $stats['active_orders'] }}</p>
            <p class="font-body text-xs text-txt-muted mt-1">Order Aktif</p>
        </div>

        <!-- Revenue -->
        <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <span class="text-xs font-medium text-txt-muted">{{ $stats['pending_payments'] }} pending</span>
            </div>
            <p class="font-display text-2xl font-bold text-txt-main">Rp {{ number_format($stats['total_revenue'], 0, ',', '.') }}</p>
            <p class="font-body text-xs text-txt-muted mt-1">Total Revenue</p>
        </div>

        <!-- Portfolios -->
        <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <span class="text-xs font-medium text-txt-muted">{{ $stats['total_services'] }} layanan</span>
            </div>
            <p class="font-display text-2xl font-bold text-txt-main">{{ $stats['total_portfolios'] }}</p>
            <p class="font-body text-xs text-txt-muted mt-1">Total Portofolio</p>
        </div>
    </div>

    <!-- Two Column: Recent Leads + Recent Orders -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Leads -->
        <div class="card">
            <div class="p-6 border-b border-border-minimal flex items-center justify-between">
                <h2 class="font-display text-base font-semibold text-txt-main">Leads Terbaru</h2>
                <a href="{{ route('admin.leads.index') }}" class="text-xs text-brand-primary font-medium hover:underline">Lihat Semua →</a>
            </div>
            <div class="divide-y divide-border-minimal">
                @forelse($recentLeads as $lead)
                    <div class="p-4 hover:bg-canvas-overlay/50 transition-colors">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="font-body text-sm font-semibold text-txt-main">{{ $lead->name }}</p>
                                <p class="font-body text-xs text-txt-muted">{{ $lead->company ?? $lead->email }}</p>
                            </div>
                            <span class="badge text-[10px]
                                {{ $lead->status === 'new' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-txt-muted' }}">
                                {{ ucfirst($lead->status) }}
                            </span>
                        </div>
                        <div class="mt-2 flex items-center gap-3">
                            <span class="text-[11px] text-txt-muted">{{ $lead->budget_label }}</span>
                            <span class="text-[11px] text-txt-muted">•</span>
                            <span class="text-[11px] text-txt-muted">Score: {{ $lead->lead_score }}</span>
                        </div>
                    </div>
                @empty
                    <div class="p-8 text-center">
                        <p class="text-sm text-txt-muted">Belum ada leads masuk.</p>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="card">
            <div class="p-6 border-b border-border-minimal flex items-center justify-between">
                <h2 class="font-display text-base font-semibold text-txt-main">Order Terbaru</h2>
                <a href="{{ route('admin.orders.index') }}" class="text-xs text-brand-primary font-medium hover:underline">Lihat Semua →</a>
            </div>
            <div class="divide-y divide-border-minimal">
                @forelse($recentOrders as $order)
                    <div class="p-4 hover:bg-canvas-overlay/50 transition-colors">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="font-body text-sm font-semibold text-txt-main">{{ $order->project_name }}</p>
                                <p class="font-body text-xs text-txt-muted">{{ $order->order_number }} • {{ $order->user->name ?? '-' }}</p>
                            </div>
                            <span class="badge text-[10px]
                                @switch($order->status)
                                    @case('pending') bg-status-warning/10 text-status-warning @break
                                    @case('in_progress') bg-brand-primary/10 text-brand-primary @break
                                    @case('completed') bg-brand-accent/10 text-brand-accent @break
                                    @case('cancelled') bg-status-danger/10 text-status-danger @break
                                @endswitch">
                                {{ ucfirst(str_replace('_', ' ', $order->status)) }}
                            </span>
                        </div>
                        <p class="mt-1 font-display text-sm font-bold text-txt-main">{{ $order->formatted_amount }}</p>
                    </div>
                @empty
                    <div class="p-8 text-center">
                        <p class="text-sm text-txt-muted">Belum ada orders.</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
</div>
