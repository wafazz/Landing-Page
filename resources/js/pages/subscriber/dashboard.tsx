import { Head } from '@inertiajs/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import SubscriberLayout from '@/layouts/subscriber-layout';
import SmallBox from '@/components/small-box';
import QuickAction from '@/components/quick-action';
import TrialBanner from '@/components/trial-banner';

interface Series { labels: string[]; values: number[] }
interface KPI {
    pages: number;
    products: number;
    orders_month: number;
    revenue_month: number;
    views_month: number;
    conversion_rate: number;
    orders_change: number;
    revenue_change: number;
}
interface TopProduct { name: string; revenue: number; qty: number }
interface RecentOrder {
    id: number;
    order_number: string;
    customer_name: string;
    total: string;
    payment_status: string;
    created_at: string;
}

interface Props {
    kpis: KPI;
    revenueTrend: Series;
    ordersWeek: Series;
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
}

const statusMeta = (s: string) => {
    if (s === 'paid') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill' };
    if (s === 'pending') return { cls: 'text-bg-warning', icon: 'bi-hourglass-split' };
    if (s === 'refunded') return { cls: 'text-bg-secondary', icon: 'bi-arrow-counterclockwise' };
    return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill' };
};

export default function SubscriberDashboard({ kpis, revenueTrend, ordersWeek, topProducts, recentOrders }: Props) {
    const revenueChart: ApexOptions = {
        chart: { type: 'area', toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#0d6efd'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        xaxis: { categories: revenueTrend.labels },
        yaxis: { labels: { formatter: (v) => `RM ${v.toFixed(0)}` } },
        grid: { borderColor: '#f1f1f1' },
        tooltip: { y: { formatter: (v) => `RM ${v.toFixed(2)}` } },
    };
    const revenueSeries = [{ name: 'Revenue', data: revenueTrend.values }];

    const ordersChart: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        colors: ['#198754'],
        dataLabels: { enabled: false },
        xaxis: { categories: ordersWeek.labels },
        grid: { borderColor: '#f1f1f1' },
    };
    const ordersSeries = [{ name: 'Orders', data: ordersWeek.values }];

    const topProductsChart: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        colors: ['#6f42c1'],
        dataLabels: { enabled: false },
        xaxis: { categories: topProducts.map(p => p.name) },
        tooltip: { y: { formatter: (v) => `RM ${v.toFixed(2)}` } },
    };
    const topProductsSeries = [{ name: 'Revenue', data: topProducts.map(p => Number(p.revenue)) }];

    const trendBadge = (v: number) =>
        v >= 0
            ? { cls: 'text-success', icon: 'bi-arrow-up-short', text: `+${v}%` }
            : { cls: 'text-danger', icon: 'bi-arrow-down-short', text: `${v}%` };

    const revTrend = trendBadge(kpis.revenue_change);
    const ordTrend = trendBadge(kpis.orders_change);

    return (
        <SubscriberLayout
            pageTitle="Dashboard"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
        >
            <Head title="Dashboard" />

            <TrialBanner />

            <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="Landing Pages" value={kpis.pages} icon="bi-file-earmark-text-fill" color="primary" href="/pages" />
                </div>
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="Products" value={kpis.products} icon="bi-box-seam-fill" color="success" href="/products" />
                </div>
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="Orders (month)" value={kpis.orders_month} icon="bi-bag-check-fill" color="info" href="/orders" trend={{ value: kpis.orders_change, label: 'vs last month' }} />
                </div>
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="Revenue (month)" value={Math.round(kpis.revenue_month)} icon="bi-cash-stack" color="warning" prefix="RM " trend={{ value: kpis.revenue_change, label: 'vs last month' }} />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Page Views (month)</small>
                                <i className="bi bi-eye-fill text-primary"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{kpis.views_month.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Conversion Rate</small>
                                <i className="bi bi-graph-up-arrow text-success"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{kpis.conversion_rate}%</h3>
                            <small className="text-muted">orders / views</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Revenue Δ</small>
                                <i className={`bi ${revTrend.icon} ${revTrend.cls}`}></i>
                            </div>
                            <h3 className={`mt-2 mb-0 ${revTrend.cls}`}>{revTrend.text}</h3>
                            <small className="text-muted">vs last month</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Orders Δ</small>
                                <i className={`bi ${ordTrend.icon} ${ordTrend.cls}`}></i>
                            </div>
                            <h3 className={`mt-2 mb-0 ${ordTrend.cls}`}>{ordTrend.text}</h3>
                            <small className="text-muted">vs last month</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Create Landing Page" description="Start a new page" icon="bi-plus-circle-fill" color="primary" href="/pages/create" />
                </div>
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Add Product" description="Wire to your page" icon="bi-box-seam-fill" color="success" href="/products/create" />
                </div>
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Analytics" description="Per-page breakdown" icon="bi-graph-up" color="info" href="/analytics" />
                </div>
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Payment Gateway" description="Billplz / SenangPay" icon="bi-credit-card-fill" color="warning" href="/payment-settings" />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-graph-up-arrow text-primary me-2"></i>Revenue Trend
                            </h5>
                            <span className="badge text-bg-light">Last 30 days</span>
                        </div>
                        <div className="card-body">
                            <ReactApexChart options={revenueChart} series={revenueSeries} type="area" height={300} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-trophy text-warning me-2"></i>Top Products
                            </h5>
                        </div>
                        <div className="card-body">
                            {topProducts.length === 0 ? (
                                <div className="text-center text-secondary py-4">
                                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                    No paid orders yet
                                </div>
                            ) : (
                                <ReactApexChart options={topProductsChart} series={topProductsSeries} type="bar" height={300} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-lg-5">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-bar-chart text-success me-2"></i>Orders This Week
                            </h5>
                        </div>
                        <div className="card-body">
                            <ReactApexChart options={ordersChart} series={ordersSeries} type="bar" height={260} />
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-clock-history text-info me-2"></i>Recent Orders
                            </h5>
                            <a href="/orders" className="btn btn-sm btn-outline-primary">View all</a>
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th className="text-end">Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center text-secondary py-4">
                                                <i className="bi bi-bag-x fs-1 d-block mb-2"></i>
                                                No orders yet
                                            </td>
                                        </tr>
                                    ) : recentOrders.map(o => {
                                        const meta = statusMeta(o.payment_status);
                                        return (
                                            <tr key={o.id}>
                                                <td className="fw-medium"><i className="bi bi-receipt text-secondary me-1"></i>{o.order_number}</td>
                                                <td><i className="bi bi-person-circle text-secondary me-1"></i>{o.customer_name}</td>
                                                <td className="text-end fw-semibold">RM {Number(o.total).toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${meta.cls}`}>
                                                        <i className={`bi ${meta.icon} me-1`}></i>{o.payment_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </SubscriberLayout>
    );
}
