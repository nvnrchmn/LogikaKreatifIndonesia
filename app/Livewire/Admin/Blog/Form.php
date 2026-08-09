<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Blog;

use App\Models\Post;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Component;

class Form extends Component
{
    public ?Post $post = null;
    public string $title = '';
    public string $slug = '';
    public string $excerpt = '';
    public string $body = '';
    public $featured_image = null; // UploadedFile | string(url lama) | null
    public bool $is_published = false;

    public function mount(?Post $post = null): void
    {
        $this->post = $post;
        if ($post && $post->exists) {
            $this->title = $post->title;
            $this->slug = $post->slug;
            $this->excerpt = (string) $post->excerpt;
            $this->body = (string) $post->body;
            $this->featured_image = (string) $post->featured_image;
            $this->is_published = (bool) $post->is_published;
        }
    }

    protected function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts,slug' . ($this->post?->id ? ',' . $this->post->id : ''),
            'excerpt' => 'nullable|string|max:500',
            'body' => 'required|string',
            'featured_image' => 'nullable',
            'is_published' => 'boolean',
        ];
    }

    public function updatedFeaturedImage($value)
    {
        // validate manual karena rule di atas nullable (terima file atau string)
        if ($value instanceof UploadedFile) {
            $this->validateOnly('featured_image', ['featured_image' => 'image|max:5120']);
        }
    }

    public function updatedTitle($value)
    {
        if (!$this->slug && !$this->post?->exists) {
            $this->slug = \Illuminate\Support\Str::slug($value);
        }
    }

    public function save()
    {
        $data = $this->validate();

        // Handle featured image upload to S3 (replace if new file uploaded)
        if ($this->featured_image instanceof UploadedFile) {
            if ($this->post && $this->post->exists && $this->post->featured_image) {
                Storage::disk('s3')->delete($this->post->featured_image);
            }
            $path = 'logikraf/blog/' . Str::uuid() . '.' . $this->featured_image->getClientOriginalExtension();
            Storage::disk('s3')->put($path, file_get_contents($this->featured_image->getRealPath()));
            $data['featured_image'] = $path;
        }
        // jika bukan file (string URL lama / kosong) -> biarkan apa adanya
        elseif (!is_string($this->featured_image)) {
            unset($data['featured_image']);
        }

        $data['published_at'] = $this->is_published ? now() : null;

        if ($this->post && $this->post->exists) {
            $this->post->update($data);
        } else {
            Post::create($data + ['author_id' => auth()->id()]);
        }

        session()->flash('message', 'Artikel tersimpan.');
        return redirect()->route('admin.blog.index');
    }

    public function render()
    {
        return view('livewire.admin.blog.form')
            ->layout('components.layouts.admin');
    }
}
