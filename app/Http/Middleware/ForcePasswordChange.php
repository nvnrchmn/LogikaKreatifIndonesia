<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->must_change_password) {
            // Check if they are already on the reset route or logout route
            if (!$request->is('client/force-password-reset') && !$request->is('livewire/*') && !$request->is('logout')) {
                return redirect()->route('client.force_password_reset');
            }
        }

        return $next($request);
    }
}
