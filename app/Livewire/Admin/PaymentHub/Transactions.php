<?php

namespace App\Livewire\Admin\PaymentHub;

use Livewire\Component;
use App\Models\PaymentHub\PhTransaction;
use Livewire\Attributes\Layout;
use Livewire\WithPagination;

#[Layout('components.layouts.admin', ['title' => 'Payment Hub Transactions'])]
class Transactions extends Component
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

    public function render()
    {
        $query = PhTransaction::with(['saasApplication', 'subAccount'])
            ->when($this->search, function ($q) {
                $q->where('external_id', 'like', '%' . $this->search . '%')
                  ->orWhereHas('saasApplication', function ($q2) {
                      $q2->where('name', 'like', '%' . $this->search . '%');
                  })
                  ->orWhereHas('subAccount', function ($q3) {
                      $q3->where('business_name', 'like', '%' . $this->search . '%');
                  });
            })
            ->when($this->statusFilter, function ($q) {
                $q->where('status', $this->statusFilter);
            })
            ->latest();

        return view('components.admin.payment-hub.transactions', [
            'transactions' => $query->paginate(15)
        ]);
    }
}
