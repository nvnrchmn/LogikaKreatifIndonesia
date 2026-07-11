<?php

declare(strict_types=1);

namespace App\Livewire;

use App\Models\Lead;
use Livewire\Component;

class ProjectBriefForm extends Component
{
    public int $step = 1;
    public int $totalSteps = 3;

    // Step 1: Contact Info
    public string $name = '';
    public string $email = '';
    public string $phone = '';
    public string $company = '';

    // Step 2: Project Details
    public string $service_category = '';
    public string $project_description = '';
    public string $estimated_pages = '';

    // Step 3: Budget & Timeline
    public string $budget_range = '';
    public string $target_launch = '';

    // Result
    public bool $submitted = false;

    protected function rules(): array
    {
        return match ($this->step) {
            1 => [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'company' => 'nullable|string|max:255',
            ],
            2 => [
                'service_category' => 'required|in:software,uiux,marketing,branding',
                'project_description' => 'required|string|min:20|max:2000',
                'estimated_pages' => 'nullable|string|max:50',
            ],
            3 => [
                'budget_range' => 'required|in:under_10m,10m_25m,25m_50m,50m_100m,above_100m',
                'target_launch' => 'nullable|string|max:100',
            ],
            default => [],
        };
    }

    protected function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'service_category.required' => 'Pilih kategori layanan yang diinginkan.',
            'project_description.required' => 'Deskripsi proyek wajib diisi.',
            'project_description.min' => 'Deskripsi proyek minimal 20 karakter.',
            'budget_range.required' => 'Pilih estimasi budget proyek.',
        ];
    }

    public function nextStep(): void
    {
        $this->validate();
        $this->step = min($this->step + 1, $this->totalSteps);
    }

    public function prevStep(): void
    {
        $this->step = max($this->step - 1, 1);
    }

    public function submit(): void
    {
        $this->validate();

        $lead = Lead::create([
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company' => $this->company,
            'service_category' => $this->service_category,
            'project_description' => $this->project_description,
            'estimated_pages' => $this->estimated_pages,
            'target_launch' => $this->target_launch,
            'budget_range' => $this->budget_range,
        ]);

        try {
            // Configure SMTP dynamically from Settings if available
            $mailHost = \App\Models\Setting::get('mail_host');
            if ($mailHost) {
                config([
                    'mail.mailers.smtp.host' => $mailHost,
                    'mail.mailers.smtp.port' => \App\Models\Setting::get('mail_port'),
                    'mail.mailers.smtp.username' => \App\Models\Setting::get('mail_username'),
                    'mail.mailers.smtp.password' => \App\Models\Setting::get('mail_password'),
                    'mail.mailers.smtp.encryption' => \App\Models\Setting::get('mail_encryption'),
                    'mail.from.address' => \App\Models\Setting::get('mail_from_address', 'hello@logikraf.id'),
                ]);
            }

            // Send Email to Admin
            \Illuminate\Support\Facades\Mail::to('admin@logikraf.id')->send(new \App\Mail\NewLeadNotification($lead));
            
            // Send Email to Client
            \Illuminate\Support\Facades\Mail::to($lead->email)->send(new \App\Mail\ClientLeadNotification($lead));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send lead emails: ' . $e->getMessage());
        }

        $this->submitted = true;
        
        $this->dispatch('swal', [
            'title' => 'Terima Kasih!',
            'text' => 'Pengajuan proyek Anda telah berhasil dikirim. Silakan cek email Anda.',
            'icon' => 'success',
            'timer' => 5000
        ]);
    }

    public function render()
    {
        return view('livewire.project-brief-form');
    }
}
