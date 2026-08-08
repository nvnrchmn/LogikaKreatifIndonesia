<?php

declare(strict_types=1);

namespace App\Livewire\Admin\TimeTracking;

use App\Models\Order;
use App\Models\OrderTask;
use App\Models\TimeEntry;
use Livewire\Component;

class Index extends Component
{
    public ?int $order_id = null;
    public ?int $order_task_id = null;
    public string $description = '';
    public int $hours = 0;
    public int $minutes = 0;
    public string $worked_date = '';

    public function mount(): void
    {
        $this->worked_date = now()->format('Y-m-d');
    }

    public function getOrdersProperty()
    {
        return Order::latest()->get();
    }

    public function getTasksProperty()
    {
        if (!$this->order_id) {
            return collect();
        }
        return OrderTask::where('order_id', $this->order_id)->get();
    }

    public function getEntriesProperty()
    {
        return TimeEntry::with(['order', 'task', 'user'])
            ->latest('worked_date')
            ->paginate(20);
    }

    public function getTotalMinutesProperty()
    {
        return TimeEntry::sum('minutes');
    }

    public function save(): void
    {
        $this->validate([
            'order_id' => 'required|exists:orders,id',
            'description' => 'nullable|string|max:255',
            'hours' => 'required|integer|min:0',
            'minutes' => 'required|integer|min:0|max:59',
            'worked_date' => 'required|date',
        ]);

        $total = ($this->hours * 60) + $this->minutes;
        if ($total <= 0) {
            session()->flash('error', 'Durasi harus lebih dari 0.');
            return;
        }

        TimeEntry::create([
            'order_id' => $this->order_id,
            'order_task_id' => $this->order_task_id ?: null,
            'user_id' => auth()->id(),
            'description' => $this->description ?: null,
            'minutes' => $total,
            'worked_date' => $this->worked_date,
        ]);

        $this->reset(['description', 'hours', 'minutes', 'order_task_id']);
        $this->worked_date = now()->format('Y-m-d');
        session()->flash('success', 'Time entry tersimpan.');
    }

    public function deleteEntry(int $id): void
    {
        TimeEntry::where('id', $id)->delete();
        session()->flash('success', 'Time entry dihapus.');
    }

    public function render()
    {
        return view('livewire.admin.time-tracking.index')
            ->layout('components.layouts.admin');
    }
}
