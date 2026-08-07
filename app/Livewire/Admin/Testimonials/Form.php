<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Testimonials;

use App\Models\Testimonial;
use Livewire\Component;

class Form extends Component
{
    public ?Testimonial $testimonial = null;

    public string $client_name = '';
    public string $company = '';
    public string $position = '';
    public string $content = '';
    public bool $is_featured = false;
    public bool $is_approved = false;
    public int $sort_order = 0;

    public function mount(?Testimonial $testimonial = null): void
    {
        $this->testimonial = $testimonial;
        if ($testimonial && $testimonial->exists) {
            $this->client_name = $testimonial->client_name;
            $this->company = (string) $testimonial->company;
            $this->position = (string) $testimonial->position;
            $this->content = $testimonial->content;
            $this->is_featured = $testimonial->is_featured;
            $this->is_approved = $testimonial->is_approved;
            $this->sort_order = $testimonial->sort_order;
        }
    }

    protected function rules(): array
    {
        return [
            'client_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'content' => 'required|string',
            'sort_order' => 'integer|min:0',
        ];
    }

    public function save(): void
    {
        $this->validate();
        $data = [
            'client_name' => $this->client_name,
            'company' => $this->company ?: null,
            'position' => $this->position ?: null,
            'content' => $this->content,
            'is_featured' => $this->is_featured,
            'is_approved' => $this->is_approved,
            'sort_order' => $this->sort_order,
        ];

        if ($this->testimonial && $this->testimonial->exists) {
            $this->testimonial->update($data);
        } else {
            Testimonial::create($data);
        }

        session()->flash('success', 'Testimonial tersimpan.');
        $this->redirectRoute('admin.testimonials.index');
    }

    public function render()
    {
        return view('livewire.admin.testimonials.form')
            ->layout('components.layouts.admin');
    }
}
