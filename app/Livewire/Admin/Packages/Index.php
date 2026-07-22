<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Packages;

use App\Models\Package;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public string $search = '';
    public bool $isModalOpen = false;

    // Form fields
    public ?int $packageId = null;
    public string $name = '';
    public string $tagline = '';
    public int $price = 0;
    public ?int $strike_price = null;
    public string $features_text = ''; // Input per baris
    public bool $is_featured = false;
    public bool $is_active = true;
    public int $sort_order = 1;

    protected function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'price' => 'required|integer|min:0',
            'strike_price' => 'nullable|integer|min:0',
            'features_text' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'required|integer|min:0',
        ];
    }

    protected function messages(): array
    {
        return [
            'name.required' => 'Nama paket wajib diisi.',
            'price.required' => 'Harga paket wajib diisi.',
            'price.min' => 'Harga paket tidak boleh kurang dari 0.',
        ];
    }

    public function updatingSearch(): void
    {
        $this->resetPage();
    }

    public function create(): void
    {
        $this->resetForm();
        $this->isModalOpen = true;
    }

    public function edit(int $id): void
    {
        $this->resetForm();
        $package = Package::findOrFail($id);

        $this->packageId = $package->id;
        $this->name = $package->name;
        $this->tagline = $package->tagline ?? '';
        $this->price = $package->price;
        $this->strike_price = $package->strike_price;
        $this->features_text = is_array($package->features) ? implode("\n", $package->features) : '';
        $this->is_featured = (bool) $package->is_featured;
        $this->is_active = (bool) $package->is_active;
        $this->sort_order = $package->sort_order;

        $this->isModalOpen = true;
    }

    public function store(): void
    {
        $this->validate();

        // Convert multiline text to array features
        $featuresArray = array_filter(
            array_map('trim', explode("\n", $this->features_text)),
            fn ($item) => !empty($item)
        );

        $data = [
            'name' => $this->name,
            'slug' => Str::slug($this->name),
            'tagline' => $this->tagline,
            'price' => $this->price,
            'strike_price' => $this->strike_price ? (int) $this->strike_price : null,
            'features' => array_values($featuresArray),
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];

        Package::updateOrCreate(['id' => $this->packageId], $data);

        $this->dispatch('swal', [
            'title' => 'Berhasil!',
            'text' => $this->packageId ? 'Paket layanan berhasil diperbarui.' : 'Paket layanan baru berhasil ditambahkan.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);

        $this->closeModal();
    }

    public function toggleActive(int $id): void
    {
        $package = Package::findOrFail($id);
        $package->update(['is_active' => !$package->is_active]);

        $this->dispatch('swal', [
            'title' => 'Status Diubah',
            'text' => 'Status aktif paket ' . $package->name . ' telah diperbarui.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 2500
        ]);
    }

    public function toggleFeatured(int $id): void
    {
        $package = Package::findOrFail($id);
        $package->update(['is_featured' => !$package->is_featured]);

        $this->dispatch('swal', [
            'title' => 'Status Diubah',
            'text' => 'Status unggulan paket ' . $package->name . ' telah diperbarui.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 2500
        ]);
    }

    public function delete(int $id): void
    {
        Package::findOrFail($id)->delete();

        $this->dispatch('swal', [
            'title' => 'Terhapus!',
            'text' => 'Paket layanan berhasil dihapus.',
            'icon' => 'success',
            'toast' => true,
            'position' => 'top-end',
            'showConfirmButton' => false,
            'timer' => 3000
        ]);
    }

    public function closeModal(): void
    {
        $this->isModalOpen = false;
        $this->resetForm();
    }

    private function resetForm(): void
    {
        $this->packageId = null;
        $this->name = '';
        $this->tagline = '';
        $this->price = 0;
        $this->strike_price = null;
        $this->features_text = '';
        $this->is_featured = false;
        $this->is_active = true;
        $this->sort_order = 1;
        $this->resetValidation();
    }

    public function render()
    {
        $packages = Package::where('name', 'like', '%' . $this->search . '%')
            ->orderBy('sort_order')
            ->paginate(10);

        return view('livewire.admin.packages.index', compact('packages'))
            ->layout('components.layouts.admin', ['title' => 'Manajemen Paket Layanan']);
    }
}
