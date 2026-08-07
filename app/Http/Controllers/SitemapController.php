<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Service;
use App\Models\Portfolio;
use Illuminate\Http\Request;

class SitemapController extends Controller
{
    public function __invoke(Request $request)
    {
        $base = rtrim(config('app.url', 'https://logikraf.id'), '/');

        $urls = [];

        // Static pages
        $static = [
            '' => '1.0',
            '/tentang-kami' => '0.8',
            '/layanan' => '0.9',
            '/portfolio' => '0.9',
            '/paket' => '0.8',
            '/blog' => '0.8',
            '/kontak' => '0.7',
            '/search' => '0.4',
        ];
        foreach ($static as $path => $priority) {
            $urls[] = [
                'loc' => $base . $path,
                'priority' => $priority,
                'changefreq' => 'weekly',
            ];
        }

        // Blog posts
        foreach (Post::published()->latest('published_at')->get() as $post) {
            $urls[] = [
                'loc' => $base . '/blog/' . $post->slug,
                'priority' => '0.7',
                'changefreq' => 'monthly',
                'lastmod' => $post->published_at?->toAtomString(),
            ];
        }

        // Services
        foreach (Service::all() as $service) {
            $urls[] = [
                'loc' => $base . '/layanan/' . $service->slug,
                'priority' => '0.8',
                'changefreq' => 'monthly',
            ];
        }

        // Portfolios
        foreach (Portfolio::all() as $portfolio) {
            $urls[] = [
                'loc' => $base . '/portfolio/' . $portfolio->slug,
                'priority' => '0.7',
                'changefreq' => 'monthly',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        foreach ($urls as $u) {
            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>' . e($u['loc']) . '</loc>' . PHP_EOL;
            if (!empty($u['lastmod'])) {
                $xml .= '    <lastmod>' . $u['lastmod'] . '</lastmod>' . PHP_EOL;
            }
            $xml .= '    <changefreq>' . $u['changefreq'] . '</changefreq>' . PHP_EOL;
            $xml .= '    <priority>' . $u['priority'] . '</priority>' . PHP_EOL;
            $xml .= '  </url>' . PHP_EOL;
        }
        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
