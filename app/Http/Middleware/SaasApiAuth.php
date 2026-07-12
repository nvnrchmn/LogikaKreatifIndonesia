<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\PaymentHub\SaasApplication;

class SaasApiAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-Logikraf-API-Key');

        if (!$apiKey) {
            return response()->json(['message' => 'API Key is missing'], 401);
        }

        $saasApp = SaasApplication::where('api_key', $apiKey)->where('is_active', true)->first();

        if (!$saasApp) {
            return response()->json(['message' => 'Invalid or inactive API Key'], 401);
        }

        // Attach the authenticated SaaS App to the request
        $request->merge(['saas_app' => $saasApp]);

        return $next($request);
    }
}
