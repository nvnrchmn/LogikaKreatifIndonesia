<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        return view('admin.settings', [
            'settings' => $this->load(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $this->load();

        // Payment Gateway
        $paymentGateway = $request->input('paymentGateway', $data['paymentGateway'] ?? 'midtrans');
        Setting::set('payment_gateway_driver', $paymentGateway);
        Setting::set('midtrans_server_key', $request->input('midtransServerKey', ''));
        Setting::set('midtrans_client_key', $request->input('midtransClientKey', ''));
        Setting::set('xendit_secret_key', $request->input('xenditSecretKey', ''));
        Setting::set('xendit_public_key', $request->input('xenditPublicKey', ''));

        // Kontak
        Setting::set('company_email', $request->input('companyEmail', $data['companyEmail'] ?? ''));
        Setting::set('company_phone', $request->input('companyPhone', $data['companyPhone'] ?? ''));
        Setting::set('company_address', $request->input('companyAddress', $data['companyAddress'] ?? ''));

        // Profil Perusahaan
        Setting::set('company_name', $request->input('companyName', $data['companyName'] ?? ''));
        Setting::set('company_npwp', $request->input('companyNpwp', $data['companyNpwp'] ?? ''));
        Setting::set('company_bank_name', $request->input('companyBankName', $data['companyBankName'] ?? ''));
        Setting::set('company_bank_account', $request->input('companyBankAccount', $data['companyBankAccount'] ?? ''));
        Setting::set('company_bank_holder', $request->input('companyBankHolder', $data['companyBankHolder'] ?? ''));

        // SMTP
        Setting::set('mail_host', $request->input('mailHost', $data['mailHost'] ?? ''));
        Setting::set('mail_port', $request->input('mailPort', $data['mailPort'] ?? ''));
        Setting::set('mail_username', $request->input('mailUsername', $data['mailUsername'] ?? ''));
        Setting::set('mail_password', $request->input('mailPassword', $data['mailPassword'] ?? ''));
        Setting::set('mail_encryption', $request->input('mailEncryption', $data['mailEncryption'] ?? 'tls'));
        Setting::set('mail_from_address', $request->input('mailFromAddress', $data['mailFromAddress'] ?? ''));

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    private function load(): array
    {
        return [
            'paymentGateway' => Setting::get('payment_gateway_driver', 'midtrans'),
            'midtransServerKey' => Setting::get('midtrans_server_key', ''),
            'midtransClientKey' => Setting::get('midtrans_client_key', ''),
            'xenditSecretKey' => Setting::get('xendit_secret_key', ''),
            'xenditPublicKey' => Setting::get('xendit_public_key', ''),

            'companyEmail' => Setting::get('company_email', 'hello@logikraf.id'),
            'companyPhone' => Setting::get('company_phone', '+62 811-1234-5678'),
            'companyAddress' => Setting::get('company_address', 'Gedung Inovasi Lt. 3, Jl. Sudirman No. 123, Jakarta Selatan, 12190'),

            'companyName' => Setting::get('company_name', 'PT. Logika Kreatif Indonesia'),
            'companyNpwp' => Setting::get('company_npwp', ''),
            'companyBankName' => Setting::get('company_bank_name', ''),
            'companyBankAccount' => Setting::get('company_bank_account', ''),
            'companyBankHolder' => Setting::get('company_bank_holder', ''),

            'mailHost' => Setting::get('mail_host', env('MAIL_HOST', '127.0.0.1')),
            'mailPort' => Setting::get('mail_port', env('MAIL_PORT', '2525')),
            'mailUsername' => Setting::get('mail_username', env('MAIL_USERNAME', '')),
            'mailPassword' => Setting::get('mail_password', env('MAIL_PASSWORD', '')),
            'mailEncryption' => Setting::get('mail_encryption', env('MAIL_ENCRYPTION', 'tls')),
            'mailFromAddress' => Setting::get('mail_from_address', env('MAIL_FROM_ADDRESS', 'hello@logikraf.id')),
        ];
    }
}
