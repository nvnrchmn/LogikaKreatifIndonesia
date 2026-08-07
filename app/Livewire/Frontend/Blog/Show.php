<?php

declare(strict_types=1);

namespace App\Livewire\Frontend\Blog;

use App\Models\Post;
use Livewire\Component;

class Show extends Component
{
    public Post $post;

    public function mount(Post $post): void
    {
        if (!$post->is_published) {
            abort(404);
        }
    }

    public function render()
    {
        return view('livewire.frontend.blog.show', [
            'post' => $this->post,
        ]);
    }
}
