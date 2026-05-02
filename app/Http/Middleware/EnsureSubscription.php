<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || $user->role !== 'subscriber') {
            return $next($request);
        }

        $sub = $user->activeSubscription;

        if (! $sub) {
            return redirect('/subscription')->with('error', 'No active subscription. Please choose a package.');
        }

        if (! $sub->isActive() && ! $sub->isInGracePeriod()) {
            return redirect('/subscription')->with('error', 'Your subscription has expired. Please renew to continue.');
        }

        return $next($request);
    }
}
