<?php

namespace App\Http\Middleware;

use App\Models\VisitorLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LogVisitor
{
    /**
     * Bot patterns — skip agar log bersih.
     */
    private const BOT_PATTERNS = [
        'bot', 'crawl', 'slurp', 'spider', 'mediapartners',
        'google', 'bing', 'yandex', 'baidu', 'duckduckgo',
        'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
        'telegrambot', 'semrush', 'ahrefs', 'mj12', 'dotbot',
        'petalbot', 'applebot', 'cloudflare', 'uptime', 'monitor',
        'python-requests', 'curl', 'wget', 'go-http', 'java/',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // Hanya log GET ke halaman web (bukan asset/ajax/api/webhook)
        $isWebGet = $request->isMethod('GET')
            && !$request->expectsJson()
            && !str_starts_with($request->path(), 'api/')
            && !str_starts_with($request->path(), 'webhooks/')
            && !str_starts_with($request->path(), 'admin/')
            && !str_contains($request->path(), '.');

        if ($isWebGet && $this->shouldLog($request)) {
            try {
                $ua = (string) $request->userAgent();
                $isBot = $this->isBot($ua);

                VisitorLog::create([
                    'ip' => $request->ip(),
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'route_name' => $request->route()?->getName(),
                    'user_agent' => substr($ua, 0, 512),
                    'referer' => substr((string) $request->header('referer'), 0, 512),
                    'is_bot' => $isBot,
                    'user_id' => auth()->id(),
                    'user_type' => auth()->check() ? get_class(auth()->user()) : null,
                    'visited_at' => now(),
                ]);
            } catch (\Throwable $e) {
                // Jangan biarkan logging gagal menghancurkan request
                report($e);
            }
        }

        return $next($request);
    }

    private function shouldLog(Request $request): bool
    {
        // Skip CF health check & internal
        if ($request->ip() === '127.0.0.1') {
            return false;
        }
        return true;
    }

    private function isBot(string $ua): bool
    {
        $lower = strtolower($ua);
        foreach (self::BOT_PATTERNS as $pattern) {
            if (str_contains($lower, $pattern)) {
                return true;
            }
        }
        return false;
    }
}
