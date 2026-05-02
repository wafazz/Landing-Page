<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalSubs = User::where('role', 'subscriber')->count();
        $activeSubs = Subscription::whereIn('status', ['active', 'trial'])->count();
        $trials = Subscription::where('status', 'trial')->count();

        $mrr = (float) Subscription::where('status', 'active')
            ->where('billing_cycle', 'monthly')
            ->sum('amount');

        $packageDist = Package::where('is_active', true)
            ->withCount(['subscriptions as sub_count' => fn ($q) => $q->whereIn('status', ['active', 'trial'])])
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug'])
            ->map(fn ($p) => ['name' => $p->name, 'count' => $p->sub_count]);

        $signups7d = User::where('role', 'subscriber')
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->select(DB::raw('DATE(created_at) as d'), DB::raw('COUNT(*) as c'))
            ->groupBy('d')
            ->pluck('c', 'd');

        $signupsSeries = collect(range(6, 0))
            ->map(fn ($i) => Carbon::now()->subDays($i)->toDateString())
            ->map(fn ($d) => ['date' => Carbon::parse($d)->format('D'), 'count' => (int) ($signups7d[$d] ?? 0)]);

        $mrr7m = SubscriptionPayment::where('status', 'success')
            ->where('paid_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->select(DB::raw("DATE_FORMAT(paid_at, '%Y-%m') as m"), DB::raw('SUM(amount) as total'))
            ->groupBy('m')
            ->pluck('total', 'm');

        $mrrSeries = collect(range(6, 0))
            ->map(fn ($i) => Carbon::now()->subMonths($i)->format('Y-m'))
            ->map(fn ($m) => [
                'month' => Carbon::createFromFormat('Y-m', $m)->format('M'),
                'amount' => (float) ($mrr7m[$m] ?? 0),
            ]);

        $recent = User::where('role', 'subscriber')
            ->with(['activeSubscription.package'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($u) => [
                'name'     => $u->name,
                'email'    => $u->email,
                'package'  => $u->activeSubscription?->package?->name ?? '—',
                'status'   => $u->activeSubscription?->status ?? 'none',
                'date'     => $u->created_at?->toDateString(),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_subscribers' => $totalSubs,
                'active_subscriptions' => $activeSubs,
                'trials_active' => $trials,
                'mrr' => $mrr,
            ],
            'packageDist' => $packageDist,
            'signupsSeries' => $signupsSeries,
            'mrrSeries' => $mrrSeries,
            'recentSubscribers' => $recent,
        ]);
    }
}
