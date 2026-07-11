<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Services;

use App\Models\Service;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public $search = '';
    public $isModalOpen = false;
    
    // Form fields
    public $serviceId = null;
    public $name = '';
    public $category = '';
    public $short_description = '';
    public $description = '';
    public $base_price = 0;
    public $sort_order = 0;
    public $is_active = true;

    protected $rules = [
        'name' => 'required|string|max:255',
        'category' => 'required|string|max:50',
        'short_description' => 'nullable|string|max:255',
        'description' => 'required|string',
        'base_price' => 'required|numeric|min:0',
        'sort_order' => 'required|integer|min:0',
        'is_active' => 'boolean',
    ];

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function create()
    {
        $this->resetForm();
        $this->isModalOpen = true;
    }

    public function edit(int $id)
    {
        $this->resetForm();
        $service = Service::findOrFail($id);
        
        $this->serviceId = $service->id;
        $this->name = $service->name;
        $this->category = $service->category;
        $this->short_description = $service->short_description;
        $this->description = $service->description;
        $this->base_price = $service->base_price;
        $this->sort_order = $service->sort_order;
        $this->is_active = $service->is_active;

        $this->isModalOpen = true;
    }

    public function store()
    {
        $this->validate();

        $data = [
            'name' => $this->name,
            'slug' => Str::slug($this->name),
            'category' => $this->category,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
        ];

        Service::updateOrCreate(['id' => $this->serviceId], $data);

        session()->flash('success', $this->serviceId ? 'Layanan berhasil diupdate.' : 'Layanan berhasil ditambahkan.');
        
        $this->closeModal();
    }

    public function delete(int $id)
    {
        Service::findOrFail($id)->delete();
        session()->flash('success', 'Layanan berhasil dihapus.');
    }

    public function closeModal()
    {
        $this->isModalOpen = false;
        $this->resetForm();
    }

    private function resetForm()
    {
        $this->serviceId = null;
        $this->name = '';
        $this->category = '';
        $this->short_description = '';
        $this->description = '';
        $this->base_price = 0;
        $this->sort_order = 0;
        $this->is_active = true;
        $this->resetValidation();
    }

    public function render()
    {
        $services = Service::where('name', 'like', '%' . $this->search . '%')
            ->orderBy('sort_order')
            ->paginate(10);

        return view('livewire.admin.services.index', compact('services'))
            ->layout('components.layouts.admin', ['title' => 'Manajemen Layanan']);
    }
}
