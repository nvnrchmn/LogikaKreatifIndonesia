<?php

namespace App\Livewire\Admin\Orders;

use App\Models\Order;
use App\Models\OrderTask;
use Livewire\Component;

class KanbanBoard extends Component
{
    public Order $order;
    public $title = '';
    public $description = '';

    public function mount(Order $order)
    {
        $this->order = $order;
    }

    public function addTask()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $maxPosition = OrderTask::where('order_id', $this->order->id)
            ->where('status', 'todo')
            ->max('position');

        OrderTask::create([
            'order_id' => $this->order->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => 'todo',
            'position' => $maxPosition !== null ? $maxPosition + 1 : 0,
        ]);

        $this->reset(['title', 'description']);
        $this->dispatch('task-added');
        session()->flash('success', 'Tugas berhasil ditambahkan.');
    }

    public function updateTaskStatus($taskId, $newStatus)
    {
        if (in_array($newStatus, ['todo', 'in_progress', 'review', 'done'])) {
            $task = OrderTask::where('order_id', $this->order->id)->findOrFail($taskId);
            $task->update(['status' => $newStatus]);
        }
    }

    public function deleteTask($taskId)
    {
        OrderTask::where('order_id', $this->order->id)->findOrFail($taskId)->delete();
    }

    public function render()
    {
        $tasks = OrderTask::where('order_id', $this->order->id)
            ->orderBy('position')
            ->get()
            ->groupBy('status');

        // Ensure all keys exist
        $columns = [
            'todo' => $tasks->get('todo', []),
            'in_progress' => $tasks->get('in_progress', []),
            'review' => $tasks->get('review', []),
            'done' => $tasks->get('done', []),
        ];

        return view('livewire.admin.orders.kanban-board', compact('columns'));
    }
}
