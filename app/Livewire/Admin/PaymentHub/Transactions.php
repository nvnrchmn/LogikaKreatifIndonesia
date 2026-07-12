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

    public function render()
    {
        return view('components.admin.payment-hub.transactions', [
            'transactions' => PhTransaction::with(['saasApplication', 'subAccount'])->latest()->paginate(15)
        ]);
    }
}
