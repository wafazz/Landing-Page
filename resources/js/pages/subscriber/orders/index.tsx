import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import SubscriberLayout from '@/layouts/subscriber-layout';

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total: string;
    payment_status: string;
    fulfillment_status: string;
    created_at: string;
}

interface PageData {
    data: Order[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    orders: PageData;
    filters: { q: string | null; status: string | null };
}

const payBadge = (s: string) => {
    if (s === 'paid') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill' };
    if (s === 'pending') return { cls: 'text-bg-warning', icon: 'bi-clock' };
    if (s === 'failed') return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill' };
    return { cls: 'text-bg-secondary', icon: 'bi-dash-circle' };
};

const fulfillBadge = (s: string) => {
    if (s === 'shipped') return { cls: 'text-bg-info', icon: 'bi-truck' };
    if (s === 'delivered') return { cls: 'text-bg-success', icon: 'bi-check2-all' };
    if (s === 'cancelled') return { cls: 'text-bg-danger', icon: 'bi-x-circle' };
    return { cls: 'text-bg-secondary', icon: 'bi-clock' };
};

export default function OrdersIndex({ orders, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/orders', { q, status }, { preserveState: true });
    };

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (status) params.set('status', status);
        const qs = params.toString();
        return '/orders/export' + (qs ? `?${qs}` : '');
    };

    return (
        <SubscriberLayout
            pageTitle="Orders"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Orders' }]}
        >
            <Head title="Orders" />

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <form onSubmit={submit} className="row g-2">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-secondary"></i></span>
                                <input type="text" className="form-control border-start-0" placeholder="Search order #, name, email..." value={q} onChange={e => setQ(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All payment statuses</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button type="submit" className="btn btn-primary flex-grow-1"><i className="bi bi-funnel me-1"></i>Filter</button>
                            <a href={exportUrl()} className="btn btn-outline-success" title="Export CSV">
                                <i className="bi bi-download"></i>
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th className="text-end">Total</th>
                                <th>Payment</th>
                                <th>Fulfillment</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-secondary py-4">
                                        <i className="bi bi-bag-x fs-1 d-block mb-2"></i>
                                        No orders yet
                                    </td>
                                </tr>
                            ) : orders.data.map(o => {
                                const pay = payBadge(o.payment_status);
                                const ful = fulfillBadge(o.fulfillment_status);
                                return (
                                    <tr key={o.id}>
                                        <td className="fw-medium"><i className="bi bi-receipt text-secondary me-1"></i>{o.order_number}</td>
                                        <td>
                                            <div className="fw-medium">{o.customer_name}</div>
                                            <small className="text-muted">{o.customer_email}</small>
                                        </td>
                                        <td className="text-end fw-semibold">RM {o.total}</td>
                                        <td><span className={`badge ${pay.cls}`}><i className={`bi ${pay.icon} me-1`}></i>{o.payment_status}</span></td>
                                        <td><span className={`badge ${ful.cls}`}><i className={`bi ${ful.icon} me-1`}></i>{o.fulfillment_status}</span></td>
                                        <td><small>{new Date(o.created_at).toLocaleDateString()}</small></td>
                                        <td className="text-end">
                                            <Link href={`/orders/${o.id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-eye"></i></Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {orders.total > 0 && (
                    <div className="card-footer bg-white d-flex align-items-center justify-content-between">
                        <small className="text-secondary">Showing {orders.from}-{orders.to} of {orders.total}</small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                {orders.links.map((l, i) => (
                                    <li key={i} className={`page-item ${l.active ? 'active' : ''} ${!l.url ? 'disabled' : ''}`}>
                                        {l.url ? <Link href={l.url} className="page-link" dangerouslySetInnerHTML={{ __html: l.label }} preserveState /> : <span className="page-link" dangerouslySetInnerHTML={{ __html: l.label }} />}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </SubscriberLayout>
    );
}
