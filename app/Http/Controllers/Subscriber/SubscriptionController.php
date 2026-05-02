<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $current = $user->activeSubscription()->with('package')->first();

        $packages = Package::where('is_active', true)
            ->where('tag', '!=', 'trial')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('subscriber/subscription', [
            'current' => $current ? [
                'id' => $current->id,
                'status' => $current->status,
                'package' => $current->package,
                'amount' => $current->amount,
                'starts_at' => $current->starts_at?->toDateString(),
                'ends_at' => $current->ends_at?->toDateString(),
                'trial_ends_at' => $current->trial_ends_at?->toDateString(),
                'days_left' => $current->daysLeft(),
                'is_trial' => $current->isTrial(),
            ] : null,
            'packages' => $packages,
        ]);
    }
}
