<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Invoices;

use App\Models\Invoice;
use Livewire\Component;

class Index extends Component
{
    public function render()
    {
        $invoices = Invoice::latest()->paginate(15);
        return view('livewire.admin.invoices.index', compact('invoices'))
            ->layout('components.layouts.admin');
    }
}
