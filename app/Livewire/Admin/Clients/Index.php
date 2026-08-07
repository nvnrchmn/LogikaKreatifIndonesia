<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Clients;

use App\Models\Client;
use Livewire\Component;

class Index extends Component
{
    public function render()
    {
        $clients = Client::latest()->paginate(15);
        return view('livewire.admin.clients.index', compact('clients'))
            ->layout('components.layouts.admin');
    }
}
