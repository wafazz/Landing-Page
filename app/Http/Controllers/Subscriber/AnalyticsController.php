<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\Order;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $days = max(7, min(90, (int) $request->input('days', 30)));
        $since = now()->subDays($days - 1)->startOfDay();

        $viewsByPage = PageView::where('user_id', $userId)
            ->where('viewed_at', '>=', $since)
            ->select('landing_page_id', DB::raw('COUNT(*) as views'), DB::raw('COUNT(DISTINCT visitor_id) as unique_views'))
            ->groupBy('landing_page_id')
            ->get()
            ->keyBy('landing_page_id');

        $ordersByPage = Order::where('user_id', $userId)
            ->where('created_at', '>=', $since)
            ->select('landing_page_id',
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total ELSE 0 END) as revenue'))
            ->groupBy('landing_page_id')
            ->get()
            ->keyBy('landing_page_id');

        $pages = LandingPage::where('user_id', $userId)
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'is_published', 'views_count'])
            ->map(function ($p) use ($viewsByPage, $ordersByPage) {
                $v = $viewsByPage->get($p->id);
                $o = $ordersByPage->get($p->id);
                $views = (int) ($v->views ?? 0);
                $uniqueViews = (int) ($v->unique_views ?? 0);
                $orders = (int) ($o->orders_count ?? 0);
                $revenue = (float) ($o->revenue ?? 0);
                $conv = $views > 0 ? round(($orders / $views) * 100, 2) : 0;
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'is_published' => (bool) $p->is_published,
                    'views' => $views,
                    'unique_views' => $uniqueViews,
                    'orders' => $orders,
                    'revenue' => $revenue,
                    'conversion_rate' => $conv,
                ];
            });

        // Aggregate site-wide
        $totals = [
            'views' => $pages->sum('views'),
            'unique_views' => $pages->sum('unique_views'),
            'orders' => $pages->sum('orders'),
            'revenue' => $pages->sum('revenue'),
        ];
        $totals['conversion_rate'] = $totals['views'] > 0
            ? round(($totals['orders'] / $totals['views']) * 100, 2)
            : 0;

        // Daily series for site-wide views
        $viewsByDay = PageView::where('user_id', $userId)
            ->where('viewed_at', '>=', $since)
            ->selectRaw('DATE(viewed_at) as d, COUNT(*) as c')
            ->groupBy('d')
            ->pluck('c', 'd')
            ->toArray();

        $ordersByDay = Order::where('user_id', $userId)
            ->where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
            ->groupBy('d')
            ->pluck('c', 'd')
            ->toArray();

        $labels = [];
        $viewsSeries = [];
        $ordersSeries = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = now()->subDays($i)->toDateString();
            $labels[] = now()->subDays($i)->format('M j');
            $viewsSeries[] = (int) ($viewsByDay[$d] ?? 0);
            $ordersSeries[] = (int) ($ordersByDay[$d] ?? 0);
        }

        // Top referrers
        $referrers = PageView::where('user_id', $userId)
            ->where('viewed_at', '>=', $since)
            ->whereNotNull('referrer')
            ->selectRaw("SUBSTRING_INDEX(SUBSTRING_INDEX(referrer, '/', 3), '://', -1) as host, COUNT(*) as c")
            ->groupBy('host')
            ->orderByDesc('c')
            ->limit(8)
            ->get();

        return Inertia::render('subscriber/analytics/index', [
            'days' => $days,
            'totals' => $totals,
            'pages' => $pages,
            'series' => [
                'labels' => $labels,
                'views' => $viewsSeries,
                'orders' => $ordersSeries,
            ],
            'referrers' => $referrers,
        ]);
    }
}
