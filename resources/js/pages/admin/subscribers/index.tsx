import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

interface Sub {
    id: number;
    name: string;
    email: string;
    subscriber_slug: string | null;
    is_active: boolean;
    package: string | null;
    status: string;
    days_left: number;
    created_at: string;
}

interface PageData {
    data: Sub[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    subscribers: PageData;
    filters: { q: string | null; status: string | null };
}

const statusMeta = (s: string) => {
    if (s === 'active') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill' };
    if (s === 'trial') return { cls: 'text-bg-info', icon: 'bi-hourglass-split' };
    if (s === 'expired') return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill' };
    return { cls: 'text-bg-secondary', icon: 'bi-dash-circle' };
};

export default function SubscribersIndex({ subscribers, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/subscribers', { q, status }, { preserveState: true });
    };

    return (
        <AdminLayout
            pageTitle="Subscribers"
            breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Subscribers' }]}
        >
            <Head title="Subscribers" />

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <form onSubmit={submit} className="row g-2">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search text-secondary"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search by name, email, or slug..."
                                    value={q}
                                    onChange={e => setQ(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="trial">Trial</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="bi bi-funnel me-1"></i>Filter
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Subscriber</th>
                                    <th>Subdomain</th>
                                    <th>Package</th>
                                    <th>Status</th>
                                    <th>Days Left</th>
                                    <th>Joined</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-secondary py-4">
                                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                            No subscribers found
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.data.map(s => {
                                        const meta = statusMeta(s.status);
                                        return (
                                            <tr key={s.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                            <i className="bi bi-person-fill"></i>
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium">{s.name}</div>
                                                            <small className="text-muted">{s.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {s.subscriber_slug ? (
                                                        <code className="small">{s.subscriber_slug}.lpage.my</code>
                                                    ) : '—'}
                                                </td>
                                                <td>{s.package ?? '—'}</td>
                                                <td>
                                                    <span className={`badge ${meta.cls}`}>
                                                        <i className={`bi ${meta.icon} me-1`}></i>{s.status}
                                                    </span>
                                                </td>
                                                <td>{s.days_left} d</td>
                                                <td>{s.created_at}</td>
                                                <td className="text-end">
                                                    <Link href={`/admin/subscribers/${s.id}`} className="btn btn-sm btn-outline-primary">
                                                        <i className="bi bi-eye me-1"></i>View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {subscribers.total > 0 && (
                    <div className="card-footer bg-white d-flex align-items-center justify-content-between">
                        <small className="text-secondary">
                            Showing {subscribers.from}-{subscribers.to} of {subscribers.total}
                        </small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                {subscribers.links.map((l, i) => (
                                    <li key={i} className={`page-item ${l.active ? 'active' : ''} ${!l.url ? 'disabled' : ''}`}>
                                        {l.url ? (
                                            <Link href={l.url} className="page-link" dangerouslySetInnerHTML={{ __html: l.label }} preserveState />
                                        ) : (
                                            <span className="page-link" dangerouslySetInnerHTML={{ __html: l.label }} />
                                        )}
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
