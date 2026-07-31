<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Transactions;

use App\Models\Transaction;
use Livewire\Attributes\On;
use Livewire\Component;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public $search = '';
    public $statusFilter = '';

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function updatingStatusFilter()
    {
        $this->resetPage();
    }

    #[On('markAsPaid')]
    public function markAsPaid(int $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        $transaction->update([
            'status' => 'settlement',
            'payment_method' => 'manual_bank_transfer',
            'settled_at' => now(),
        ]);

        // Auto-update order milestone status
        $order = $transaction->order;
        $orderTransactions = $order->transactions()->orderBy('id')->get();
        
        $paidCount = $orderTransactions->where('status', 'settlement')->count();
        
        if ($paidCount === 1) {
            $order->update([
                'status' => 'in_progress',
                'milestone_status' => 'dev_pending'
            ]);
        } elseif ($paidCount === 2) {
            $order->update(['milestone_status' => 'uat_pending']);
        } elseif ($paidCount === 3) {
            $order->update([
                'status' => 'completed',
                'milestone_status' => 'completed'
            ]);
        }

        $this->dispatch('swal', [
            'title' => 'Berhasil!',
            'text' => 'Transaksi berhasil ditandai sebagai lunas.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    #[On('markAsFailed')]
    public function markAsFailed(int $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        $transaction->update([
            'status' => 'expired',
        ]);

        $this->dispatch('swal', [
            'title' => 'Dibatalkan!',
            'text' => 'Transaksi ditandai gagal/expired.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    #[On('deleteConfirmed')]
    public function delete(int $id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        $this->dispatch('swal:deleted', [
            'text' => 'Transaksi berhasil dihapus.',
            'id' => $id,
            'restoreAction' => 'restore'
        ]);
    }

    #[On('restore')]
    public function restore(int $id)
    {
        $transaction = Transaction::withTrashed()->findOrFail($id);
        $transaction->restore();

        $this->dispatch('swal', [
            'title' => 'Di-undo!',
            'text' => 'Data transaksi berhasil dikembalikan.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    public function render()
    {
        $query = Transaction::with(['order.user', 'order.service']);

        if ($this->search) {
            $query->where(function($q) {
                $q->where('transaction_reference', 'like', '%' . $this->search . '%')
                  ->orWhereHas('order', function($qo) {
                      $qo->where('order_number', 'like', '%' . $this->search . '%')
                         ->orWhere('project_name', 'like', '%' . $this->search . '%');
                  })
                  ->orWhereHas('order.user', function($qu) {
                      $qu->where('name', 'like', '%' . $this->search . '%');
                  });
            });
        }

        if ($this->statusFilter) {
            $query->where('status', $this->statusFilter);
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(15);

        return view('livewire.admin.transactions.index', compact('transactions'))
            ->layout('components.layouts.admin', ['title' => 'Monitoring Transaksi']);
    }
}
