<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Clients;

use App\Models\Client;
use Livewire\Component;

class Form extends Component
{
    public ?Client $client = null;

    public string $company_name = '';
    public string $pic_name = '';
    public string $email = '';
    public string $phone = '';
    public string $address = '';
    public string $city = '';
    public string $notes = '';

    public function mount(?Client $client = null): void
    {
        $this->client = $client;
        if ($client && $client->exists) {
            $this->company_name = (string) $client->company_name;
            $this->pic_name = $client->pic_name;
            $this->email = (string) $client->email;
            $this->phone = (string) $client->phone;
            $this->address = (string) $client->address;
            $this->city = (string) $client->city;
            $this->notes = (string) $client->notes;
        }
    }

    protected function rules(): array
    {
        return [
            'company_name' => 'nullable|string|max:255',
            'pic_name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ];
    }

    public function save(): void
    {
        $this->validate();
        $data = [
            'company_name' => $this->company_name ?: null,
            'pic_name' => $this->pic_name,
            'email' => $this->email ?: null,
            'phone' => $this->phone ?: null,
            'address' => $this->address ?: null,
            'city' => $this->city ?: null,
            'notes' => $this->notes ?: null,
        ];

        if ($this->client && $this->client->exists) {
            $this->client->update($data);
        } else {
            Client::create($data);
        }

        session()->flash('success', 'Client tersimpan.');
        $this->redirectRoute('admin.clients.index');
    }

    public function render()
    {
        return view('livewire.admin.clients.form')
            ->layout('components.layouts.admin');
    }
}
