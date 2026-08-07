<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Testimonials;

use App\Models\Testimonial;
use Livewire\Component;

class Index extends Component
{
    public function render()
    {
        $testimonials = Testimonial::orderBy('sort_order')->latest()->paginate(15);
        return view('livewire.admin.testimonials.index', compact('testimonials'))
            ->layout('components.layouts.admin');
    }
}
