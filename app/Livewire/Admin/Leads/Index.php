<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Leads;

use App\Models\Lead;
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
            session()->flash('success', 'Status lead berhasil diperbarui.');
            $this->closeModal();
        }
    }

    public function closeModal()
    {
        $this->isModalOpen = false;
        $this->viewingLead = null;
    }

    public function delete(int $id)
    {
        Lead::findOrFail($id)->delete();
        session()->flash('success', 'Lead berhasil dihapus.');
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
