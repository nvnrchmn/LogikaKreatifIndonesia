<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Blog;

use App\Models\Post;
use Livewire\Component;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public function delete(Post $post)
    {
        $post->delete();
        session()->flash('message', 'Artikel dihapus.');
    }

    public function render()
    {
        return view('livewire.admin.blog.index', [
            'posts' => Post::latest()->paginate(10),
        ])->layout('components.layouts.admin');
    }
}
