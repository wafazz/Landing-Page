import { Head } from '@inertiajs/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import AdminLayout from '@/layouts/admin-layout';
import SmallBox from '@/components/small-box';
import QuickAction from '@/components/quick-action';

interface Props {
    stats: {
        total_subscribers: number;
        active_subscriptions: number;
        trials_active: number;
        mrr: number;
    };
    packageDist: { name: string; count: number }[];
    signupsSeries: { date: string; count: number }[];
    mrrSeries: { month: string; amount: number }[];
    recentSubscribers: {
        name: string;
        email: string;
        package: string;
        status: string;
        date: string;
    }[];
}

const statusMeta = (s: string) => {
    if (s === 'active') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill' };
    if (s === 'trial') return { cls: 'text-bg-info', icon: 'bi-hourglass-split' };
    if (s === 'expired') return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill' };
    return { cls: 'text-bg-secondary', icon: 'bi-dash-circle' };
};

const packageIcon = (p: string) => {
    if (p === 'Trial') return 'bi-hourglass';
    if (p === 'Starter') return 'bi-rocket';
    if (p === 'Pro') return 'bi-rocket-takeoff';
    if (p === 'Business') return 'bi-rocket-takeoff-fill';
    return 'bi-box';
};

export default function AdminDashboard({ stats, packageDist, signupsSeries, mrrSeries, recentSubscribers }: Props) {
    const mrrChart: ApexOptions = {
        chart: { type: 'area', toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#198754'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        xaxis: { categories: mrrSeries.map(m => m.month) },
        yaxis: { labels: { formatter: (v) => `RM ${v}` } },
        grid: { borderColor: '#f1f1f1' },
        tooltip: { y: { formatter: (v) => `RM ${v.toFixed(2)}` } },
    };

    const packageChart: ApexOptions = {
        chart: { type: 'donut' },
        labels: packageDist.map(p => p.name),
        colors: ['#6c757d', '#0dcaf0', '#0d6efd', '#198754', '#ffc107'],
        legend: { position: 'bottom' },
        plotOptions: { pie: { donut: { size: '70%' } } },
    };

    const signupsChart: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        colors: ['#6f42c1'],
        dataLabels: { enabled: false },
        xaxis: { categories: signupsSeries.map(s => s.date) },
        grid: { borderColor: '#f1f1f1' },
    };

    return (
        <AdminLayout
            pageTitle="Admin Dashboard"
            breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Dashboard' }]}
        >
            <Head title="Admin Dashboard" />

            <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="Total Subscribers" value={stats.total_subscribers} icon="bi-people-fill" color="primary" href="/admin/subscribers" />
                </div>
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="Active Subscriptions" value={stats.active_subscriptions} icon="bi-patch-check-fill" color="success" />
                </div>
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="MRR" value={stats.mrr} icon="bi-graph-up-arrow" color="info" prefix="RM " />
                </div>
                <div className="col-lg-3 col-md-6">
                    <SmallBox title="Trials Active" value={stats.trials_active} icon="bi-hourglass-split" color="warning" />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Manage Packages" description="Create / edit tiers" icon="bi-box-fill" color="primary" href="/admin/packages" />
                </div>
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Subscribers" description="View all subscribers" icon="bi-people-fill" color="success" href="/admin/subscribers" />
                </div>
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Review Payments" description="Approve manual transfers" icon="bi-cash-coin" color="info" href="/admin/payments" />
                </div>
                <div className="col-md-6 col-lg-3">
                    <QuickAction title="Platform Settings" description="API keys / branding" icon="bi-sliders" color="warning" href="/admin/settings" />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-graph-up-arrow text-success me-2"></i>Monthly Recurring Revenue
                            </h5>
                            <span className="badge text-bg-light">7 months</span>
                        </div>
                        <div className="card-body">
                            <ReactApexChart options={mrrChart} series={[{ name: 'MRR', data: mrrSeries.map(m => m.amount) }]} type="area" height={300} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-pie-chart text-primary me-2"></i>Package Distribution
                            </h5>
                        </div>
                        <div className="card-body">
                            {packageDist.length > 0 ? (
                                <ReactApexChart options={packageChart} series={packageDist.map(p => p.count)} type="donut" height={300} />
                            ) : (
                                <p className="text-secondary text-center py-5">No subscriptions yet</p>
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
                                <i className="bi bi-person-plus me-2" style={{ color: '#6f42c1' }}></i>
                                New Signups (This Week)
                            </h5>
                        </div>
                        <div className="card-body">
                            <ReactApexChart options={signupsChart} series={[{ name: 'New Signups', data: signupsSeries.map(s => s.count) }]} type="bar" height={260} />
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-clock-history text-info me-2"></i>Recent Subscribers
                            </h5>
                            <a href="/admin/subscribers" className="btn btn-sm btn-outline-primary">View all</a>
                        </div>
                        <div className="card-body p-0">
                            {recentSubscribers.length === 0 ? (
                                <p className="text-secondary text-center py-4 mb-0">No subscribers yet</p>
                            ) : (
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Subscriber</th>
                                            <th>Package</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSubscribers.map(s => {
                                            const meta = statusMeta(s.status);
                                            return (
                                                <tr key={s.email}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                                <i className="bi bi-person-fill"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-medium">{s.name}</div>
                                                                <small className="text-muted">
                                                                    <i className="bi bi-envelope-fill me-1"></i>{s.email}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <i className={`bi ${packageIcon(s.package)} text-primary me-1`}></i>{s.package}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${meta.cls}`}>
                                                            <i className={`bi ${meta.icon} me-1`}></i>{s.status}
                                                        </span>
                                                    </td>
                                                    <td><i className="bi bi-calendar-event text-secondary me-1"></i>{s.date}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
