<?php

declare(strict_types=1);

namespace App\Livewire;

use App\Models\Post;
use Livewire\Component;

class BlogShow extends Component
{
    public Post $post;
    public $related = [];

    public function mount(Post $post): void
    {
        if (!$post->is_published) {
            abort(404);
        }
        $this->post = $post->load('author');
        $this->related = Post::query()
            ->where('is_published', true)
            ->where('id', '!=', $post->id)
            ->where('author_id', $post->author_id)
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();
    }

    public function readingTime(): int
    {
        $words = str_word_count(strip_tags($this->post->body));
        return max(1, (int) ceil($words / 200));
    }

    public function render()
    {
        return view('livewire.frontend.blog.show', [
            'post' => $this->post,
        ]);
    }
}
