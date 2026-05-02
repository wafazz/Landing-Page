import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

interface Subscription {
    id: number;
    user: { id: number; name: string; email: string; slug: string };
    package: string | null;
    amount: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    days_left: number;
    gateway: string | null;
    created_at: string | null;
}

interface PageData {
    data: Subscription[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    subscriptions: PageData;
    kpis: { active: number; mrr: number; trials: number; expiring_soon: number };
    packages: { id: number; name: string }[];
    filters: { q: string | null; status: string | null; package_id: string | null };
}

const statusBadge = (s: string) => {
    if (s === 'active') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill' };
    if (s === 'trial') return { cls: 'text-bg-info', icon: 'bi-clock-history' };
    if (s === 'expired') return { cls: 'text-bg-secondary', icon: 'bi-hourglass-bottom' };
    if (s === 'cancelled') return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill' };
    return { cls: 'text-bg-light', icon: 'bi-dash-circle' };
};

export default function SubscriptionsIndex({ subscriptions, kpis, packages, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [packageId, setPackageId] = useState(filters.package_id ?? '');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/subscriptions', { q, status, package_id: packageId }, { preserveState: true });
    };

    return (
        <AdminLayout
            pageTitle="Subscriptions"
            breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Subscriptions' }]}
        >
            <Head title="Subscriptions" />

            <div className="row g-3">
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">Active</small>
                                <i className="bi bi-check-circle-fill text-success"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{kpis.active}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">MRR</small>
                                <i className="bi bi-cash-stack text-warning"></i>
                            </div>
                            <h3 className="mt-2 mb-0">RM {Number(kpis.mrr).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">Trials</small>
                                <i className="bi bi-clock-history text-info"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{kpis.trials}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">Expiring (7d)</small>
                                <i className="bi bi-exclamation-triangle-fill text-danger"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{kpis.expiring_soon}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mt-3 mb-3">
                <div className="card-body">
                    <form onSubmit={submit} className="row g-2">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search text-secondary"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search subscriber name, email, slug..."
                                    value={q}
                                    onChange={e => setQ(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="trial">Trial</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={packageId} onChange={e => setPackageId(e.target.value)}>
                                <option value="">All packages</option>
                                {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="bi bi-funnel me-1"></i>Filter
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Subscriber</th>
                                <th>Package</th>
                                <th className="text-end">Amount</th>
                                <th>Status</th>
                                <th>Period</th>
                                <th className="text-end">Days Left</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-secondary py-4">
                                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                        No subscriptions match
                                    </td>
                                </tr>
                            ) : subscriptions.data.map(s => {
                                const meta = statusBadge(s.status);
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="fw-medium">
                                                <i className="bi bi-person-circle text-secondary me-1"></i>{s.user.name}
                                            </div>
                                            <small className="text-muted">{s.user.email}</small>
                                        </td>
                                        <td>
                                            {s.package ? (
                                                <span className="badge text-bg-primary"><i className="bi bi-box me-1"></i>{s.package}</span>
                                            ) : <span className="text-muted">—</span>}
                                        </td>
                                        <td className="text-end fw-semibold">RM {Number(s.amount).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${meta.cls}`}>
                                                <i className={`bi ${meta.icon} me-1`}></i>{s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="d-block">{s.starts_at}</small>
                                            <small className="text-muted">→ {s.ends_at}</small>
                                        </td>
                                        <td className="text-end">
                                            {s.days_left > 0 ? (
                                                <span className={`badge ${s.days_left <= 7 ? 'text-bg-warning' : 'text-bg-light text-dark'}`}>
                                                    {s.days_left}d
                                                </span>
                                            ) : <span className="text-muted">—</span>}
                                        </td>
                                        <td className="text-end">
                                            <Link
                                                href={`/admin/subscribers/${s.user.id}`}
                                                className="btn btn-sm btn-outline-primary"
                                                title="View subscriber"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {subscriptions.total > 0 && (
                    <div className="card-footer bg-white d-flex align-items-center justify-content-between">
                        <small className="text-secondary">Showing {subscriptions.from}-{subscriptions.to} of {subscriptions.total}</small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                {subscriptions.links.map((l, i) => (
                                    <li key={i} className={`page-item ${l.active ? 'active' : ''} ${!l.url ? 'disabled' : ''}`}>
                                        {l.url
                                            ? <Link href={l.url} className="page-link" dangerouslySetInnerHTML={{ __html: l.label }} preserveState />
                                            : <span className="page-link" dangerouslySetInnerHTML={{ __html: l.label }} />}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
