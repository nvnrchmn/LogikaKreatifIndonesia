<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Blog;

use App\Models\Post;
use Livewire\Component;

class Form extends Component
{
    public ?Post $post = null;
    public string $title = '';
    public string $slug = '';
    public string $excerpt = '';
    public string $body = '';
    public string $featured_image = '';
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
            'featured_image' => 'nullable|string|max:500',
            'is_published' => 'boolean',
        ];
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
