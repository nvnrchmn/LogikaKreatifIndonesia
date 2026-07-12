<?php

namespace App\Livewire\Admin\PaymentHub;

use Livewire\Component;
use Livewire\Attributes\Layout;

#[Layout('components.layouts.admin', ['title' => 'API Documentation'])]
class ApiDocs extends Component
{
    public function render()
    {
        return view('components.admin.payment-hub.api-docs');
    }
}
