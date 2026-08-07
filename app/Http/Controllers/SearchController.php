<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Service;
use App\Models\Portfolio;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $results = ['posts' => [], 'services' => [], 'portfolios' => []];

        if (strlen($q) >= 2) {
            $results['posts'] = Post::published()
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('excerpt', 'like', "%{$q}%")
                        ->orWhere('body', 'like', "%{$q}%");
                })
                ->limit(10)
                ->get();

            $results['services'] = Service::where('name', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%")
                ->limit(10)
                ->get();

            $results['portfolios'] = Portfolio::where('title', 'like', "%{$q}%")
                ->orWhere('client_name', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%")
                ->limit(10)
                ->get();
        }

        return view('pages.search', [
            'q' => $q,
            'results' => $results,
            'total' => count($results['posts']) + count($results['services']) + count($results['portfolios']),
        ]);
    }
}
