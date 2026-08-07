<?php

declare(strict_types=1);

namespace App\Livewire;

use App\Models\Post;
use Livewire\Component;

class BlogIndex extends Component
{
    public function render()
    {
        return view('livewire.frontend.blog.index', [
            'posts' => Post::published()->latest('published_at')->paginate(9),
        ]);
    }
}
