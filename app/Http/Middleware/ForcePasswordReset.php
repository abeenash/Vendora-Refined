<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class ForcePasswordReset
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $mustReset = Auth::check() && Auth::user()->first_login === true;
        $onResetPage = $request->routeIs('force-password-reset', 'force-password-reset.update');

        if ($mustReset && !$onResetPage) {
            return redirect()->route('force-password-reset');
        }

        //someone who already set their password has no reason to be on the reset page
        if (!$mustReset && $onResetPage && Auth::check()) {
            return redirect()->route(Auth::user()->dashboardRoute());
        }

        return $next($request);
    }
}
