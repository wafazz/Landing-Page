import { Head, router } from '@inertiajs/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import SubscriberLayout from '@/layouts/subscriber-layout';

interface PageRow {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    views: number;
    unique_views: number;
    orders: number;
    revenue: number;
    conversion_rate: number;
}

interface Totals {
    views: number;
    unique_views: number;
    orders: number;
    revenue: number;
    conversion_rate: number;
}

interface Series {
    labels: string[];
    views: number[];
    orders: number[];
}

interface Referrer { host: string; c: number }

interface Props {
    days: number;
    totals: Totals;
    pages: PageRow[];
    series: Series;
    referrers: Referrer[];
}

export default function AnalyticsIndex({ days, totals, pages, series, referrers }: Props) {
    const trendChart: ApexOptions = {
        chart: { type: 'line', toolbar: { show: false } },
        stroke: { curve: 'smooth', width: [3, 3] },
        colors: ['#0d6efd', '#198754'],
        xaxis: { categories: series.labels },
        yaxis: [
            { title: { text: 'Views' }, labels: { formatter: (v) => v.toFixed(0) } },
            { opposite: true, title: { text: 'Orders' }, labels: { formatter: (v) => v.toFixed(0) } },
        ],
        legend: { position: 'top' },
        grid: { borderColor: '#f1f1f1' },
    };
    const trendSeries = [
        { name: 'Views', data: series.views },
        { name: 'Orders', data: series.orders, type: 'line' as const },
    ];

    const referrerChart: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        colors: ['#6f42c1'],
        xaxis: { categories: referrers.map(r => r.host || 'direct') },
        dataLabels: { enabled: false },
    };
    const referrerSeries = [{ name: 'Visits', data: referrers.map(r => r.c) }];

    const setDays = (d: number) => router.get('/analytics', { days: d }, { preserveState: true });

    return (
        <SubscriberLayout
            pageTitle="Analytics"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Analytics' }]}
        >
            <Head title="Analytics" />

            <div className="d-flex justify-content-end mb-3">
                <div className="btn-group">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            type="button"
                            className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setDays(d)}
                        >
                            Last {d} days
                        </button>
                    ))}
                </div>
            </div>

            <div className="row g-3">
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Page Views</small>
                                <i className="bi bi-eye-fill text-primary"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{totals.views.toLocaleString()}</h3>
                            <small className="text-muted">{totals.unique_views.toLocaleString()} unique</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Orders</small>
                                <i className="bi bi-bag-check-fill text-success"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{totals.orders.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Revenue</small>
                                <i className="bi bi-cash-stack text-warning"></i>
                            </div>
                            <h3 className="mt-2 mb-0">RM {Number(totals.revenue).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <small className="text-secondary">Conversion</small>
                                <i className="bi bi-graph-up-arrow text-info"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{totals.conversion_rate}%</h3>
                            <small className="text-muted">orders / views</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-activity text-primary me-2"></i>Views & Orders Trend
                            </h5>
                        </div>
                        <div className="card-body">
                            <ReactApexChart options={trendChart} series={trendSeries} height={320} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-link-45deg text-purple me-2"></i>Top Referrers
                            </h5>
                        </div>
                        <div className="card-body">
                            {referrers.length === 0 ? (
                                <div className="text-center text-secondary py-4">
                                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                    No referrer data
                                </div>
                            ) : (
                                <ReactApexChart options={referrerChart} series={referrerSeries} type="bar" height={320} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mt-3">
                <div className="card-header">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-list-columns text-info me-2"></i>Performance by Page
                    </h5>
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Page</th>
                                <th className="text-end">Views</th>
                                <th className="text-end">Unique</th>
                                <th className="text-end">Orders</th>
                                <th className="text-end">Revenue</th>
                                <th className="text-end">Conv. Rate</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.length === 0 ? (
                                <tr><td colSpan={7} className="text-center text-secondary py-4">No pages yet</td></tr>
                            ) : pages.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="fw-medium">
                                            <i className="bi bi-file-earmark-text text-secondary me-1"></i>{p.title}
                                        </div>
                                        <small className="text-muted">/{p.slug}</small>
                                        {!p.is_published && <span className="badge text-bg-secondary ms-2">draft</span>}
                                    </td>
                                    <td className="text-end">{p.views.toLocaleString()}</td>
                                    <td className="text-end">{p.unique_views.toLocaleString()}</td>
                                    <td className="text-end">{p.orders.toLocaleString()}</td>
                                    <td className="text-end fw-semibold">RM {Number(p.revenue).toFixed(2)}</td>
                                    <td className="text-end">
                                        <span className={`badge ${p.conversion_rate >= 2 ? 'text-bg-success' : p.conversion_rate >= 0.5 ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                                            {p.conversion_rate}%
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <a href={`/pages/${p.id}/edit`} className="btn btn-sm btn-outline-primary">
                                            <i className="bi bi-pencil"></i>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SubscriberLayout>
    );
}
