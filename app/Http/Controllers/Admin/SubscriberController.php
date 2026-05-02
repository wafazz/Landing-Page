<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriberController extends Controller
{
    public function index(Request $request): Response
    {
        $q = $request->input('q');
        $status = $request->input('status');

        $subscribers = User::where('role', 'subscriber')
            ->with(['activeSubscription.package'])
            ->when($q, function ($query, $q) {
                $query->where(function ($w) use ($q) {
                    $w->where('name', 'like', "%$q%")
                      ->orWhere('email', 'like', "%$q%")
                      ->orWhere('subscriber_slug', 'like', "%$q%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->whereHas('activeSubscription', fn ($w) => $w->where('status', $status));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($u) => [
                'id'              => $u->id,
                'name'            => $u->name,
                'email'           => $u->email,
                'subscriber_slug' => $u->subscriber_slug,
                'is_active'       => $u->is_active,
                'package'         => $u->activeSubscription?->package?->name,
                'status'          => $u->activeSubscription?->status ?? 'none',
                'days_left'       => $u->activeSubscription?->daysLeft() ?? 0,
                'created_at'      => $u->created_at?->toDateString(),
            ]);

        return Inertia::render('admin/subscribers/index', [
            'subscribers' => $subscribers,
            'filters' => ['q' => $q, 'status' => $status],
        ]);
    }

    public function show(User $subscriber): Response
    {
        abort_if($subscriber->role !== 'subscriber', 404);

        $subscriber->load(['subscriptions.package', 'activeSubscription.package']);

        return Inertia::render('admin/subscribers/show', [
            'subscriber' => [
                'id'              => $subscriber->id,
                'name'            => $subscriber->name,
                'email'           => $subscriber->email,
                'phone'           => $subscriber->phone,
                'subscriber_slug' => $subscriber->subscriber_slug,
                'is_active'       => $subscriber->is_active,
                'created_at'      => $subscriber->created_at?->toDateString(),
            ],
            'currentSubscription' => $subscriber->activeSubscription ? [
                'status'    => $subscriber->activeSubscription->status,
                'package'   => $subscriber->activeSubscription->package?->name,
                'amount'    => $subscriber->activeSubscription->amount,
                'starts_at' => $subscriber->activeSubscription->starts_at?->toDateString(),
                'ends_at'   => $subscriber->activeSubscription->ends_at?->toDateString(),
                'days_left' => $subscriber->activeSubscription->daysLeft(),
            ] : null,
            'history' => $subscriber->subscriptions->map(fn ($s) => [
                'id'         => $s->id,
                'package'    => $s->package?->name,
                'status'     => $s->status,
                'amount'     => $s->amount,
                'starts_at'  => $s->starts_at?->toDateString(),
                'ends_at'    => $s->ends_at?->toDateString(),
            ]),
        ]);
    }
}
