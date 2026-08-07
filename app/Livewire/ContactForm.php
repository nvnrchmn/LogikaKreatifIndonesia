<?php

declare(strict_types=1);

namespace App\Livewire;

use App\Models\Lead;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Livewire\Component;

class ContactForm extends Component
{
    public string $name = '';
    public string $email = '';
    public string $category = '';
    public string $message = '';

    public bool $submitted = false;

    protected function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'category' => 'required|in:proyek_agensi,saas_sales,dukungan_teknis,lainnya',
            'message' => 'required|string|min:10|max:2000',
        ];
    }

    protected function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'category.required' => 'Pilih kategori pesan.',
            'message.required' => 'Pesan wajib diisi.',
            'message.min' => 'Pesan minimal 10 karakter.',
        ];
    }

    public function submit()
    {
        $this->validate();

        try {
            $lead = Lead::create([
                'name' => $this->name,
                'email' => $this->email,
                'service_category' => $this->mapCategory(),
                'notes' => $this->message,
                'status' => 'new',
            ]);

            // Notify admin + client (fails silently if mail not configured)
            try {
                Mail::to('admin@logikraf.id')->send(new \App\Mail\NewLeadNotification($lead));
                Mail::to($this->email)->send(new \App\Mail\ClientLeadNotification($lead));
            } catch (\Exception $mailEx) {
                Log::warning('Contact mail failed: ' . $mailEx->getMessage());
            }

            $this->submitted = true;
            $this->reset(['name', 'email', 'category', 'message']);
        } catch (\Exception $e) {
            Log::error('Contact form failed: ' . $e->getMessage());
            session()->flash('error', 'Gagal mengirim pesan. Silakan coba lagi.');
        }
    }

    private function mapCategory(): string
    {
        return match ($this->category) {
            'proyek_agensi' => 'branding',
            'saas_sales' => 'software',
            'dukungan_teknis' => 'uiux',
            default => 'marketing',
        };
    }

    public function render()
    {
        return view('livewire.contact-form');
    }
}
