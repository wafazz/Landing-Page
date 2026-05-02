<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $sub = $user?->isSubscriber() ? $user->activeSubscription()->with('package')->first() : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'subscription' => $sub ? [
                'id' => $sub->id,
                'status' => $sub->status,
                'package_name' => $sub->package?->name,
                'package_slug' => $sub->package?->slug,
                'is_trial' => $sub->isTrial(),
                'is_active' => $sub->isActive(),
                'in_grace' => $sub->isInGracePeriod(),
                'days_left' => $sub->daysLeft(),
                'ends_at' => $sub->ends_at?->toDateString(),
                'trial_ends_at' => $sub->trial_ends_at?->toDateString(),
                'features' => [
                    'max_landing_pages' => $sub->package?->max_landing_pages,
                    'max_products' => $sub->package?->max_products,
                    'can_use_drag_drop' => (bool) $sub->package?->can_use_drag_drop,
                    'can_connect_courier' => (bool) $sub->package?->can_connect_courier,
                    'can_print_awb' => (bool) $sub->package?->can_print_awb,
                    'can_use_custom_domain' => (bool) $sub->package?->can_use_custom_domain,
                ],
            ] : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'info'    => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'siteName' => Setting::get('site_name', config('app.name')),
            'siteLogo' => Setting::get('site_logo'),
        ];
    }
}
