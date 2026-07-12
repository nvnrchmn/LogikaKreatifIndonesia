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
    <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800">Detail Pesanan: {{ $order->order_number }}</h2>
        <a href="{{ route('admin.orders.index') }}" class="text-indigo-600 hover:underline text-sm font-medium">
            &larr; Kembali ke Daftar
        </a>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Kolom Kiri: Detail -->
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Informasi Proyek</h3>
                <dl class="space-y-3 text-sm">
                    <div>
                        <dt class="text-gray-500">Nama Proyek</dt>
                        <dd class="font-medium text-gray-900">{{ $order->project_name }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Klien</dt>
                        <dd class="font-medium text-gray-900">{{ $order->user->name }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500">Status</dt>
                        <dd>
                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                {{ ucfirst($order->status) }}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>
            
            <!-- AssetVault Component -->
            <livewire:shared.asset-vault :order_id="$order->id" />
        </div>

        <!-- Kolom Kanan: Chat -->
        <div class="lg:col-span-2">
            <livewire:shared.project-thread :order_id="$order->id" />
            <livewire:admin.orders.kanban-board :order="$order" />
        </div>
    </div>
</div>