<?php

declare(strict_types=1);

namespace App\Livewire;

use Livewire\Component;

class Navbar extends Component
{
    public bool $scrolled = false;
    public bool $mobileMenuOpen = false;

    public array $navLinks = [
        ['label' => 'Beranda', 'href' => '/'],
        ['label' => 'Layanan', 'href' => '/#layanan'],
        ['label' => 'Paket UMKM', 'href' => '/paket'],
        ['label' => 'Portofolio', 'href' => '/#portofolio'],
        ['label' => 'Tentang Kami', 'href' => '/tentang-kami'],
    ];

    public function render()
    {
        return view('livewire.navbar');
    }
}
