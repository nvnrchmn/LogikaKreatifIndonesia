<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Transactions;

use App\Models\Transaction;
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

        session()->flash('success', 'Transaksi berhasil ditandai sebagai lunas.');
    }

    public function markAsFailed(int $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        $transaction->update([
            'status' => 'expired',
        ]);

        session()->flash('success', 'Transaksi ditandai gagal/expired.');
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
