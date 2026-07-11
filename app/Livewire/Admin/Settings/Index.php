<?php

namespace App\Livewire\Admin\Settings;

use Livewire\Component;
use Livewire\Attributes\Layout;
use App\Models\Setting;

#[Layout('components.layouts.admin')]
class Index extends Component
{
    public $paymentGateway = 'midtrans';
    
    public $midtransServerKey = '';
    public $midtransClientKey = '';
    public $xenditSecretKey = '';
    public $xenditPublicKey = '';

    public $companyEmail = '';
    public $companyPhone = '';
    public $companyAddress = '';

    public function mount()
    {
        $this->paymentGateway = Setting::get('payment_gateway_driver', 'midtrans');
        $this->midtransServerKey = Setting::get('midtrans_server_key', '');
        $this->midtransClientKey = Setting::get('midtrans_client_key', '');
        $this->xenditSecretKey = Setting::get('xendit_secret_key', '');
        $this->xenditPublicKey = Setting::get('xendit_public_key', '');
        
        $this->companyEmail = Setting::get('company_email', 'hello@logikraf.id');
        $this->companyPhone = Setting::get('company_phone', '+62 811-1234-5678');
        $this->companyAddress = Setting::get('company_address', 'Gedung Inovasi Lt. 3, Jl. Sudirman No. 123, Jakarta Selatan, 12190');
    }

    public function savePayment()
    {
        Setting::set('payment_gateway_driver', $this->paymentGateway);
        Setting::set('midtrans_server_key', $this->midtransServerKey);
        Setting::set('midtrans_client_key', $this->midtransClientKey);
        Setting::set('xendit_secret_key', $this->xenditSecretKey);
        Setting::set('xendit_public_key', $this->xenditPublicKey);
        
        $this->dispatch('swal', [
            'title' => 'Berhasil!',
            'text' => 'Pengaturan Payment Gateway berhasil disimpan.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    public function saveContact()
    {
        Setting::set('company_email', $this->companyEmail);
        Setting::set('company_phone', $this->companyPhone);
        Setting::set('company_address', $this->companyAddress);
        
        $this->dispatch('swal', [
            'title' => 'Berhasil!',
            'text' => 'Kontak Perusahaan berhasil disimpan.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    public function render()
    {
        return view('livewire.admin.settings.index')->title('Pengaturan Global');
    }
}
