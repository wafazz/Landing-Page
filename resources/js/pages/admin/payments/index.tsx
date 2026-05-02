import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

interface Payment {
    id: number;
    user: { name: string; email: string };
    package: string | null;
    amount: string;
    gateway: string | null;
    gateway_ref: string | null;
    status: string;
    paid_at: string | null;
    created_at: string | null;
}

interface PageData {
    data: Payment[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    payments: PageData;
    kpis: { total_paid: number; month_revenue: number; pending_count: number; failed_count: number };
    filters: { q: string | null; status: string | null; gateway: string | null };
}

const statusBadge = (s: string) => {
    if (s === 'paid') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill' };
    if (s === 'pending') return { cls: 'text-bg-warning', icon: 'bi-hourglass-split' };
    if (s === 'failed') return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill' };
    if (s === 'refunded') return { cls: 'text-bg-secondary', icon: 'bi-arrow-counterclockwise' };
    return { cls: 'text-bg-light', icon: 'bi-dash-circle' };
};

export default function PaymentsIndex({ payments, kpis, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [gateway, setGateway] = useState(filters.gateway ?? '');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/payments', { q, status, gateway }, { preserveState: true });
    };

    return (
        <AdminLayout
            pageTitle="Payments"
            breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Payments' }]}
        >
            <Head title="Payments" />

            <div className="row g-3">
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">Total Paid (all-time)</small>
                                <i className="bi bi-cash-stack text-success"></i>
                            </div>
                            <h3 className="mt-2 mb-0">RM {Number(kpis.total_paid).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">This Month</small>
                                <i className="bi bi-graph-up-arrow text-primary"></i>
                            </div>
                            <h3 className="mt-2 mb-0">RM {Number(kpis.month_revenue).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">Pending</small>
                                <i className="bi bi-hourglass-split text-warning"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{kpis.pending_count}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <small className="text-secondary">Failed</small>
                                <i className="bi bi-x-circle-fill text-danger"></i>
                            </div>
                            <h3 className="mt-2 mb-0">{kpis.failed_count}</h3>
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
                                    placeholder="Search name, email or gateway ref..."
                                    value={q}
                                    onChange={e => setQ(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={gateway} onChange={e => setGateway(e.target.value)}>
                                <option value="">All gateways</option>
                                <option value="billplz">Billplz</option>
                                <option value="senangpay">SenangPay</option>
                                <option value="manual">Manual</option>
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
                                <th>Gateway</th>
                                <th>Reference</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-secondary py-4">
                                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                        No payments yet
                                    </td>
                                </tr>
                            ) : payments.data.map(p => {
                                const meta = statusBadge(p.status);
                                return (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="fw-medium">{p.user.name}</div>
                                            <small className="text-muted">{p.user.email}</small>
                                        </td>
                                        <td>{p.package ?? <span className="text-muted">—</span>}</td>
                                        <td className="text-end fw-semibold">RM {Number(p.amount).toFixed(2)}</td>
                                        <td>
                                            {p.gateway ? <span className="badge text-bg-light text-dark text-uppercase">{p.gateway}</span> : '—'}
                                        </td>
                                        <td><small className="font-monospace">{p.gateway_ref ?? '—'}</small></td>
                                        <td>
                                            <span className={`badge ${meta.cls}`}>
                                                <i className={`bi ${meta.icon} me-1`}></i>{p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <small>{p.paid_at ?? p.created_at}</small>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {payments.total > 0 && (
                    <div className="card-footer bg-white d-flex align-items-center justify-content-between">
                        <small className="text-secondary">Showing {payments.from}-{payments.to} of {payments.total}</small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                {payments.links.map((l, i) => (
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
