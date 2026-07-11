<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Portfolios;

use App\Models\Portfolio;
use App\Models\Service;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;
    use WithFileUploads;

    public $search = '';
    public $isModalOpen = false;

    // Form fields
    public $portfolioId = null;
    public $service_id = '';
    public $title = '';
    public $excerpt = '';
    public $description = '';
    public $client_name = '';
    public $project_url = '';
    public $completed_at = '';
    public $challenge = '';
    public $solution = '';
    public $result = '';
    public $tech_stack = '';
    public $is_published = true;
    public $is_featured = false;
    public $sort_order = 0;
    
    public $thumbnail; // for upload
    public $existing_thumbnail;

    protected $rules = [
        'service_id' => 'required|exists:services,id',
        'title' => 'required|string|max:255',
        'excerpt' => 'nullable|string|max:255',
        'description' => 'required|string',
        'client_name' => 'required|string|max:255',
        'project_url' => 'nullable|url',
        'completed_at' => 'nullable|date',
        'challenge' => 'nullable|string',
        'solution' => 'nullable|string',
        'result' => 'nullable|string',
        'tech_stack' => 'nullable|string',
        'thumbnail' => 'nullable|image|max:2048', // 2MB Max
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'required|integer|min:0',
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
        $portfolio = Portfolio::findOrFail($id);
        
        $this->portfolioId = $portfolio->id;
        $this->service_id = $portfolio->service_id;
        $this->title = $portfolio->title;
        $this->excerpt = $portfolio->excerpt;
        $this->description = $portfolio->description;
        $this->client_name = $portfolio->client_name;
        $this->project_url = $portfolio->project_url;
        $this->completed_at = $portfolio->completed_at ? $portfolio->completed_at->format('Y-m-d') : '';
        $this->challenge = $portfolio->challenge;
        $this->solution = $portfolio->solution;
        $this->result = $portfolio->result;
        $this->tech_stack = is_array($portfolio->tech_stack) ? implode(', ', $portfolio->tech_stack) : '';
        $this->is_published = $portfolio->is_published;
        $this->is_featured = $portfolio->is_featured;
        $this->sort_order = $portfolio->sort_order;
        $this->existing_thumbnail = $portfolio->thumbnail;

        $this->isModalOpen = true;
    }

    public function store()
    {
        $this->validate();

        $data = [
            'service_id' => $this->service_id,
            'title' => $this->title,
            'slug' => Str::slug($this->title),
            'excerpt' => $this->excerpt,
            'description' => $this->description,
            'client_name' => $this->client_name,
            'project_url' => $this->project_url,
            'completed_at' => $this->completed_at ?: null,
            'challenge' => $this->challenge,
            'solution' => $this->solution,
            'result' => $this->result,
            'tech_stack' => array_filter(array_map('trim', explode(',', $this->tech_stack))),
            'is_published' => $this->is_published,
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
        ];

        // Handle Image Upload and Optimization (WebP)
        if ($this->thumbnail) {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($this->thumbnail->getRealPath());
            
            // Resize image to max width 1200, preserve aspect ratio
            $image->scale(width: 1200);
            
            // Encode to webp
            $encoded = $image->toWebp(quality: 80);
            
            $filename = 'portfolios/' . Str::uuid() . '.webp';
            Storage::disk('public')->put($filename, $encoded->toString());
            
            $data['thumbnail'] = $filename;

            // Delete old thumbnail if exists
            if ($this->existing_thumbnail) {
                Storage::disk('public')->delete($this->existing_thumbnail);
            }
        }

        Portfolio::updateOrCreate(['id' => $this->portfolioId], $data);

        session()->flash('success', $this->portfolioId ? 'Portofolio berhasil diupdate.' : 'Portofolio berhasil ditambahkan.');
        
        $this->closeModal();
    }

    public function delete(int $id)
    {
        $portfolio = Portfolio::findOrFail($id);
        
        if ($portfolio->thumbnail) {
            Storage::disk('public')->delete($portfolio->thumbnail);
        }
        
        $portfolio->delete();
        session()->flash('success', 'Portofolio berhasil dihapus.');
    }

    public function closeModal()
    {
        $this->isModalOpen = false;
        $this->resetForm();
    }

    private function resetForm()
    {
        $this->portfolioId = null;
        $this->service_id = '';
        $this->title = '';
        $this->excerpt = '';
        $this->description = '';
        $this->client_name = '';
        $this->project_url = '';
        $this->completed_at = '';
        $this->challenge = '';
        $this->solution = '';
        $this->result = '';
        $this->tech_stack = '';
        $this->thumbnail = null;
        $this->existing_thumbnail = null;
        $this->is_published = true;
        $this->is_featured = false;
        $this->sort_order = 0;
        $this->resetValidation();
    }

    public function render()
    {
        $portfolios = Portfolio::with('service')
            ->where('title', 'like', '%' . $this->search . '%')
            ->orderBy('sort_order')
            ->paginate(10);
            
        $services = Service::where('is_active', true)->orderBy('sort_order')->get();

        return view('livewire.admin.portfolios.index', compact('portfolios', 'services'))
            ->layout('components.layouts.admin', ['title' => 'Manajemen Portofolio']);
    }
}
