<?php

declare(strict_types=1);

namespace App\Livewire\Frontend;

use App\Models\Testimonial;
use Livewire\Component;

class Testimonials extends Component
{
    public function render()
    {
        $testimonials = Testimonial::approved()
            ->orderBy('sort_order')
            ->latest()
            ->limit(9)
            ->get();

        return view('livewire.frontend.testimonials', compact('testimonials'));
    }
}
