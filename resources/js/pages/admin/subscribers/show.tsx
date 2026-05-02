import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

interface Subscriber {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subscriber_slug: string | null;
    is_active: boolean;
    created_at: string;
}

interface Current {
    status: string;
    package: string;
    amount: string;
    starts_at: string | null;
    ends_at: string | null;
    days_left: number;
}

interface History {
    id: number;
    package: string;
    status: string;
    amount: string;
    starts_at: string | null;
    ends_at: string | null;
}

interface Props {
    subscriber: Subscriber;
    currentSubscription: Current | null;
    history: History[];
}

const statusMeta = (s: string) => {
    if (s === 'active') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill' };
    if (s === 'trial') return { cls: 'text-bg-info', icon: 'bi-hourglass-split' };
    if (s === 'expired') return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill' };
    if (s === 'cancelled') return { cls: 'text-bg-secondary', icon: 'bi-x-circle' };
    if (s === 'pending') return { cls: 'text-bg-warning', icon: 'bi-clock' };
    return { cls: 'text-bg-secondary', icon: 'bi-dash-circle' };
};

export default function SubscriberShow({ subscriber, currentSubscription, history }: Props) {
    return (
        <AdminLayout
            pageTitle={subscriber.name}
            breadcrumb={[
                { label: 'Home', href: '/admin/dashboard' },
                { label: 'Subscribers', href: '/admin/subscribers' },
                { label: subscriber.name },
            ]}
        >
            <Head title={subscriber.name} />

            <div className="row g-3">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80, fontSize: 32 }}>
                                <i className="bi bi-person-fill"></i>
                            </div>
                            <h4 className="fw-bold mb-0">{subscriber.name}</h4>
                            <p className="text-secondary small">{subscriber.email}</p>
                            <hr />
                            <div className="text-start small">
                                <p className="mb-2"><i className="bi bi-globe text-primary me-2"></i>
                                    {subscriber.subscriber_slug ? (
                                        <a href={`http://${subscriber.subscriber_slug}.lpage.my`} target="_blank" rel="noopener" className="text-decoration-none">
                                            {subscriber.subscriber_slug}.lpage.my
                                        </a>
                                    ) : '—'}
                                </p>
                                <p className="mb-2"><i className="bi bi-telephone text-success me-2"></i>{subscriber.phone ?? '—'}</p>
                                <p className="mb-2"><i className="bi bi-calendar-event text-info me-2"></i>Joined {subscriber.created_at}</p>
                                <p className="mb-0"><i className={`bi ${subscriber.is_active ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>{subscriber.is_active ? 'Active account' : 'Disabled'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-star-fill text-primary me-2"></i>Current Subscription
                            </h5>
                        </div>
                        <div className="card-body">
                            {currentSubscription ? (
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <small className="text-secondary">Package</small>
                                        <p className="fw-bold mb-0">{currentSubscription.package}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-secondary">Status</small>
                                        <div>
                                            <span className={`badge ${statusMeta(currentSubscription.status).cls}`}>
                                                <i className={`bi ${statusMeta(currentSubscription.status).icon} me-1`}></i>
                                                {currentSubscription.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-secondary">Amount</small>
                                        <p className="fw-bold mb-0">RM {currentSubscription.amount}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-secondary">Days Left</small>
                                        <p className="fw-bold mb-0 text-primary">{currentSubscription.days_left} days</p>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-secondary">Starts</small>
                                        <p className="mb-0">{currentSubscription.starts_at ?? '—'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-secondary">Ends</small>
                                        <p className="mb-0">{currentSubscription.ends_at ?? '—'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-secondary text-center mb-0 py-3">
                                    <i className="bi bi-x-circle me-1"></i>No active subscription
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-clock-history text-info me-2"></i>Subscription History
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-sm mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Package</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th>Starts</th>
                                        <th>Ends</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center text-secondary py-3">No history</td></tr>
                                    ) : history.map(h => {
                                        const meta = statusMeta(h.status);
                                        return (
                                            <tr key={h.id}>
                                                <td>{h.package}</td>
                                                <td><span className={`badge ${meta.cls}`}><i className={`bi ${meta.icon} me-1`}></i>{h.status}</span></td>
                                                <td>RM {h.amount}</td>
                                                <td>{h.starts_at ?? '—'}</td>
                                                <td>{h.ends_at ?? '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <Link href="/admin/subscribers" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-1"></i>Back
                </Link>
            </div>
        </AdminLayout>
    );
}
