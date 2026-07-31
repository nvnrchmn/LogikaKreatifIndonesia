<?php

namespace App\Livewire\Admin\PaymentHub;

use Livewire\Component;
use App\Models\PaymentHub\SaasApplication;
use Livewire\Attributes\Layout;
use Livewire\Attributes\On;
use Livewire\WithPagination;

#[Layout('components.layouts.admin', ['title' => 'Aplikasi Terintegrasi'])]
class SaasApps extends Component
{
    use WithPagination;

    public $name = '';
    public $webhook_url = '';
    public $platform_fee_type = 'fixed';
    public $platform_fee_amount = 2500;

    public function create()
    {
        $this->validate([
            'name' => 'required|string|max:255',
            'webhook_url' => 'nullable|url',
            'platform_fee_type' => 'required|in:fixed,percentage',
            'platform_fee_amount' => 'required|numeric|min:0'
        ]);

        SaasApplication::create([
            'name' => $this->name,
            'webhook_url' => $this->webhook_url,
            'platform_fee_type' => $this->platform_fee_type,
            'platform_fee_amount' => $this->platform_fee_amount
        ]);

        $this->reset(['name', 'webhook_url', 'platform_fee_type', 'platform_fee_amount']);
        $this->dispatch('swal', [
            'title' => 'Berhasil!',
            'text' => 'SaaS Application berhasil ditambahkan. API Key otomatis di-generate.',
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
        $app = SaasApplication::findOrFail($id);
        $app->delete();

        $this->dispatch('swal:deleted', [
            'text' => 'Aplikasi berhasil dihapus.',
            'id' => $id,
            'restoreAction' => 'restore'
        ]);
    }

    #[On('restore')]
    public function restore(int $id)
    {
        $app = SaasApplication::withTrashed()->findOrFail($id);
        $app->restore();

        $this->dispatch('swal', [
            'title' => 'Di-undo!',
            'text' => 'Data aplikasi berhasil dikembalikan.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    public function render()
    {
        return view('components.admin.payment-hub.saas-apps', [
            'apps' => SaasApplication::withCount('subAccounts', 'transactions')->latest()->paginate(10)
        ]);
    }
}
