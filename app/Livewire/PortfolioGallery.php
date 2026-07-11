<?php

declare(strict_types=1);

namespace App\Livewire;

use App\Models\Portfolio;
use Livewire\Component;

class PortfolioGallery extends Component
{
    public string $activeFilter = 'all';

    public array $categories = [
        'all' => 'Semua',
        'software' => 'Software',
        'uiux' => 'UI/UX',
        'marketing' => 'Marketing',
        'branding' => 'Branding',
    ];

    public function setFilter(string $category): void
    {
        $this->activeFilter = $category;
    }

    public function render()
    {
        $query = Portfolio::published()
            ->with('service')
            ->orderBy('sort_order');

        if ($this->activeFilter !== 'all') {
            $query->whereHas('service', function ($q) {
                $q->where('category', $this->activeFilter);
            });
        }

        $portfolios = $query->take(6)->get();

        return view('livewire.portfolio-gallery', compact('portfolios'));
    }
}
