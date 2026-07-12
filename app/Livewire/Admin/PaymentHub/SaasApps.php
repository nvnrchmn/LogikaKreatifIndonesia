<?php

namespace App\Livewire\Admin\PaymentHub;

use Livewire\Component;
use App\Models\PaymentHub\SaasApplication;
use Livewire\Attributes\Layout;
use Livewire\WithPagination;

#[Layout('components.layouts.admin', ['title' => 'Aplikasi Terintegrasi'])]
class SaasApps extends Component
{
    use WithPagination;

    public $name = '';
    public $webhook_url = '';

    public function create()
    {
        $this->validate([
            'name' => 'required|string|max:255',
            'webhook_url' => 'nullable|url'
        ]);

        SaasApplication::create([
            'name' => $this->name,
            'webhook_url' => $this->webhook_url
        ]);

        $this->reset(['name', 'webhook_url']);
        $this->dispatch('swal', [
            'title' => 'Berhasil!',
            'text' => 'SaaS Application berhasil ditambahkan. API Key otomatis di-generate.',
            'icon' => 'success'
        ]);
    }

    public function render()
    {
        return view('components.admin.payment-hub.saas-apps', [
            'apps' => SaasApplication::withCount('subAccounts', 'transactions')->latest()->paginate(10)
        ]);
    }
}
