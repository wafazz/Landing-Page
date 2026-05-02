<?php

namespace App\Http\Middleware;

use App\Models\CustomDomain;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = strtolower($request->getHost());
        $primary = strtolower(config('app.primary_host', 'lpage.my'));

        if ($host === $primary || $host === 'www.' . $primary || str_ends_with($host, '.localhost') || $host === 'localhost' || $host === '127.0.0.1') {
            return $next($request);
        }

        if (str_ends_with($host, '.' . $primary)) {
            $slug = substr($host, 0, -strlen('.' . $primary));
            $user = User::where('subscriber_slug', $slug)->where('role', 'subscriber')->first();
            if ($user) {
                $request->attributes->set('resolved_user', $user);
                $request->attributes->set('resolved_via', 'subdomain');
            }
            return $next($request);
        }

        $custom = CustomDomain::with('user')->where('domain', $host)->where('is_verified', true)->first();
        if ($custom) {
            $request->attributes->set('resolved_user', $custom->user);
            $request->attributes->set('resolved_via', 'custom_domain');
        }

        return $next($request);
    }
}
