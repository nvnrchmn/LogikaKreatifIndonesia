<?php

use Livewire\Component;
use App\Models\Order;
use Livewire\Attributes\Layout;

new #[Layout('components.layouts.admin', ['title' => 'Detail Pesanan'])] class extends Component
{
    public Order $order;

    public function mount(Order $order)
    {
        $this->order = $order->load(['user', 'service']);
    }
};
?>

<div class="space-y-6">
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.orders.index') }}" class="w-8 h-8 flex items-center justify-center rounded-lg bg-canvas-light text-txt-muted hover:text-brand-primary transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </a>
            <h2 class="font-display text-2xl font-bold text-txt-main">Detail Pesanan</h2>
        </div>
        <p class="text-txt-muted text-sm mt-1">Order: {{ $order->order_number }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Kolom Kiri: Detail -->
        <div class="lg:col-span-1 space-y-6">
            <div class="card p-6">
                <h3 class="font-display font-semibold text-lg text-txt-main mb-4">Informasi Proyek</h3>
                <dl class="space-y-4 text-sm">
                    <div>
                        <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Nama Proyek</dt>
                        <dd class="font-medium text-txt-main">{{ $order->project_name }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Klien</dt>
                        <dd class="font-medium text-txt-main">{{ $order->user->name }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Status Proyek</dt>
                        <dd>
                            @if($order->status === 'completed')
                                <span class="badge bg-status-success/10 text-status-success">Selesai</span>
                            @elseif($order->status === 'cancelled')
                                <span class="badge bg-status-danger/10 text-status-danger">Dibatalkan</span>
                            @elseif($order->status === 'in_progress')
                                <span class="badge bg-brand-accent/10 text-brand-accent">Dalam Pengerjaan</span>
                            @else
                                <span class="badge bg-status-warning/10 text-status-warning">Pending</span>
                            @endif
                        </dd>
                    </div>
                    <div>
                        <dt class="text-xs text-txt-muted uppercase tracking-wider mb-1">Nilai Total Proyek</dt>
                        <dd class="font-display font-bold text-lg text-brand-primary">{{ $order->formatted_amount }}</dd>
                    </div>
                </dl>
            </div>
            
            <!-- AssetVault Component -->
            <livewire:shared.asset-vault :order_id="$order->id" />
        </div>

        <!-- Kolom Kanan: Chat & Kanban -->
        <div class="lg:col-span-2 space-y-6">
            <livewire:shared.project-thread :order_id="$order->id" />
            <livewire:admin.orders.kanban-board :order="$order" />
        </div>
    </div>
</div>