<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\Order;
use App\Models\PageView;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $monthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        $pagesCount = LandingPage::where('user_id', $userId)->count();
        $productsCount = Product::where('user_id', $userId)->count();

        $monthOrders = Order::where('user_id', $userId)
            ->where('created_at', '>=', $monthStart)
            ->count();

        $monthRevenue = (float) Order::where('user_id', $userId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $monthStart)
            ->sum('total');

        $lastMonthOrders = Order::where('user_id', $userId)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $lastMonthRevenue = (float) Order::where('user_id', $userId)
            ->where('payment_status', 'paid')
            ->whereBetween('paid_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total');

        $monthViews = PageView::where('user_id', $userId)
            ->where('viewed_at', '>=', $monthStart)
            ->count();

        $conversionRate = $monthViews > 0 ? round(($monthOrders / $monthViews) * 100, 2) : 0;

        // Last 30 days revenue trend
        $revenueTrend = $this->dailySeries(
            Order::where('user_id', $userId)
                ->where('payment_status', 'paid')
                ->where('paid_at', '>=', now()->subDays(29)->startOfDay())
                ->selectRaw('DATE(paid_at) as d, SUM(total) as total')
                ->groupBy('d')
                ->pluck('total', 'd')
                ->toArray(),
            30,
            fn ($v) => (float) $v
        );

        // Last 7 days orders
        $ordersWeek = $this->dailySeries(
            Order::where('user_id', $userId)
                ->where('created_at', '>=', now()->subDays(6)->startOfDay())
                ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
                ->groupBy('d')
                ->pluck('c', 'd')
                ->toArray(),
            7,
            fn ($v) => (int) $v
        );

        // Top 5 products by revenue (last 30 days, paid only)
        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.user_id', $userId)
            ->where('orders.payment_status', 'paid')
            ->where('orders.paid_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('order_items.product_name as name, SUM(order_items.subtotal) as revenue, SUM(order_items.qty) as qty')
            ->groupBy('order_items.product_name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        $recentOrders = Order::where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get(['id', 'order_number', 'customer_name', 'total', 'payment_status', 'created_at']);

        return Inertia::render('subscriber/dashboard', [
            'kpis' => [
                'pages' => $pagesCount,
                'products' => $productsCount,
                'orders_month' => $monthOrders,
                'revenue_month' => $monthRevenue,
                'views_month' => $monthViews,
                'conversion_rate' => $conversionRate,
                'orders_change' => $this->pctChange($lastMonthOrders, $monthOrders),
                'revenue_change' => $this->pctChange($lastMonthRevenue, $monthRevenue),
            ],
            'revenueTrend' => $revenueTrend,
            'ordersWeek' => $ordersWeek,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
        ]);
    }

    private function dailySeries(array $byDate, int $days, \Closure $cast): array
    {
        $labels = [];
        $values = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = now()->subDays($i)->toDateString();
            $labels[] = now()->subDays($i)->format('M j');
            $values[] = $cast($byDate[$d] ?? 0);
        }
        return ['labels' => $labels, 'values' => $values];
    }

    private function pctChange(float $prev, float $now): float
    {
        if ($prev <= 0) {
            return $now > 0 ? 100.0 : 0.0;
        }
        return round((($now - $prev) / $prev) * 100, 1);
    }
}
