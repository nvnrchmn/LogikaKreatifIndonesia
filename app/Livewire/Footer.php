<?php

declare(strict_types=1);

namespace App\Livewire;

use Livewire\Component;

class Footer extends Component
{
    public array $services = [
        'Software Development',
        'UI/UX Design',
        'Digital Marketing',
        'Branding',
    ];

    public array $quickLinks = [
        ['label' => 'Beranda', 'href' => '/'],
        ['label' => 'Layanan', 'href' => '/#layanan'],
        ['label' => 'Portofolio', 'href' => '/#portofolio'],
        ['label' => 'Konsultasi', 'href' => '/kontak'],
    ];

    public array $legalLinks = [
        ['label' => 'Tentang Kami', 'href' => '/tentang-kami'],
        ['label' => 'Syarat & Ketentuan', 'href' => '/syarat-ketentuan'],
        ['label' => 'Kebijakan Privasi', 'href' => '/kebijakan-privasi'],
    ];

    public function render()
    {
        return view('livewire.footer');
    }
}
