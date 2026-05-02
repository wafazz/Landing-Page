<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $q = $request->input('q');
        $status = $request->input('status');
        $packageId = $request->input('package_id');

        $base = Subscription::with(['user:id,name,email,subscriber_slug', 'package:id,name,price']);

        $subscriptions = (clone $base)
            ->when($q, fn ($w) => $w->whereHas('user', fn ($u) =>
                $u->where('name', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%")
                  ->orWhere('subscriber_slug', 'like', "%$q%")
            ))
            ->when($status, fn ($w) => $w->where('status', $status))
            ->when($packageId, fn ($w) => $w->where('package_id', $packageId))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($s) => [
                'id'          => $s->id,
                'user'        => [
                    'id'    => $s->user?->id,
                    'name'  => $s->user?->name,
                    'email' => $s->user?->email,
                    'slug'  => $s->user?->subscriber_slug,
                ],
                'package'     => $s->package?->name,
                'amount'      => $s->amount,
                'status'      => $s->status,
                'starts_at'   => $s->starts_at?->toDateString(),
                'ends_at'     => $s->ends_at?->toDateString(),
                'days_left'   => $s->daysLeft(),
                'gateway'     => $s->gateway,
                'created_at'  => $s->created_at?->toDateString(),
            ]);

        // KPIs
        $totalActive = Subscription::whereIn('status', ['active', 'trial'])
            ->where('ends_at', '>=', now())
            ->count();
        $mrr = (float) Subscription::where('status', 'active')
            ->where('ends_at', '>=', now())
            ->sum('amount');
        $trials = Subscription::where('status', 'trial')
            ->where('trial_ends_at', '>=', now())
            ->count();
        $expiringSoon = Subscription::whereIn('status', ['active', 'trial'])
            ->whereBetween('ends_at', [now(), now()->addDays(7)])
            ->count();

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'kpis' => [
                'active'        => $totalActive,
                'mrr'           => $mrr,
                'trials'        => $trials,
                'expiring_soon' => $expiringSoon,
            ],
            'packages' => Package::orderBy('price')->get(['id', 'name']),
            'filters'  => ['q' => $q, 'status' => $status, 'package_id' => $packageId],
        ]);
    }
}
