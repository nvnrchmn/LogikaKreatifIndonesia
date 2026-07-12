<?php

namespace App\Livewire\Admin\PaymentHub;

use Livewire\Component;
use App\Models\PaymentHub\PhDisbursement;
use Livewire\Attributes\Layout;
use Livewire\WithPagination;

#[Layout('components.layouts.admin', ['title' => 'Data Penarikan Dana'])]
class Disbursements extends Component
{
    use WithPagination;

    public $search = '';
    public $status = '';

    public function render()
    {
        $query = PhDisbursement::with(['saasApplication', 'subAccount'])
            ->latest();

        if ($this->search) {
            $query->where(function($q) {
                $q->where('external_id', 'like', '%' . $this->search . '%')
                  ->orWhere('account_holder_name', 'like', '%' . $this->search . '%')
                  ->orWhere('account_number', 'like', '%' . $this->search . '%');
            });
        }

        if ($this->status) {
            $query->where('status', $this->status);
        }

        return view('components.admin.payment-hub.disbursements', [
            'disbursements' => $query->paginate(15)
        ]);
    }
}
