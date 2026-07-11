<?php

declare(strict_types=1);

namespace App\Livewire;

use Livewire\Component;

class HeroSection extends Component
{
    public string $headline = 'Logika Bertemu Kreativitas.';
    public string $subheadline = 'Kami membangun solusi digital yang menggabungkan presisi teknologi dengan keindahan desain — dari software development hingga branding yang berdampak.';

    public function render()
    {
        return view('livewire.hero-section');
    }
}
