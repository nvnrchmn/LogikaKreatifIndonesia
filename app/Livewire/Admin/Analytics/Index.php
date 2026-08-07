<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Analytics;

use App\Models\VisitorLog;
use Livewire\Component;

class Index extends Component
{
    public function render()
    {
        $total = VisitorLog::count();
        $humans = VisitorLog::where('is_bot', false)->count();
        $bots = VisitorLog::where('is_bot', true)->count();

        $topPages = VisitorLog::selectRaw('path, COUNT(*) as hits')
            ->where('is_bot', false)
            ->groupBy('path')
            ->orderByDesc('hits')
            ->limit(10)
            ->get();

        $today = VisitorLog::where('is_bot', false)
            ->whereDate('visited_at', today())
            ->count();

        $recent = VisitorLog::with('user')
            ->latest('visited_at')
            ->limit(20)
            ->get();

        return view('livewire.admin.analytics.index', [
            'total' => $total,
            'humans' => $humans,
            'bots' => $bots,
            'today' => $today,
            'topPages' => $topPages,
            'recent' => $recent,
        ])->layout('components.layouts.admin');
    }
}
