<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Leads;

use App\Models\Lead;
use Livewire\Attributes\On;
use Livewire\Component;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public $search = '';
    public $statusFilter = '';
    
    public $isModalOpen = false;
    public $viewingLead = null;

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function updatingStatusFilter()
    {
        $this->resetPage();
    }

    public function viewLead(int $id)
    {
        $this->viewingLead = Lead::findOrFail($id);
        
        // Auto-update status to 'contacted' if it was 'new'
        if ($this->viewingLead->status === 'new') {
            $this->viewingLead->update(['status' => 'contacted']);
        }
        
        $this->isModalOpen = true;
    }

    public function updateStatus(string $status)
    {
        if ($this->viewingLead) {
            $this->viewingLead->update(['status' => $status]);
            $this->dispatch('swal', [
                'title' => 'Berhasil!',
                'text' => 'Status lead berhasil diperbarui.',
                'icon' => 'success',
                'toast' => true,
                'position' => 'top-end',
                'showConfirmButton' => false,
                'timer' => 3000
            ]);
            $this->closeModal();
        }
    }

    public function closeModal()
    {
        $this->isModalOpen = false;
        $this->viewingLead = null;
    }

    #[On('deleteConfirmed')]
    public function delete(int $id)
    {
        $lead = Lead::findOrFail($id);
        $lead->delete();

        $this->dispatch('swal:deleted', [
            'text' => 'Lead berhasil dihapus.',
            'id' => $id,
            'restoreAction' => 'restore'
        ]);
    }

    #[On('restore')]
    public function restore(int $id)
    {
        $lead = Lead::withTrashed()->findOrFail($id);
        $lead->restore();

        $this->dispatch('swal', [
            'title' => 'Di-undo!',
            'text' => 'Data lead berhasil dikembalikan.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    public function render()
    {
        $query = Lead::query();
        
        if ($this->search) {
            $query->where(function($q) {
                $q->where('name', 'like', '%' . $this->search . '%')
                  ->orWhere('email', 'like', '%' . $this->search . '%')
                  ->orWhere('company', 'like', '%' . $this->search . '%');
            });
        }
        
        if ($this->statusFilter) {
            $query->where('status', $this->statusFilter);
        }
        
        $leads = $query->orderBy('lead_score', 'desc')
                       ->orderBy('created_at', 'desc')
                       ->paginate(15);

        return view('livewire.admin.leads.index', compact('leads'))
            ->layout('components.layouts.admin', ['title' => 'Manajemen Leads']);
    }
}
