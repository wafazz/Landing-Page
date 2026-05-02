import { Head, Link, router, useForm } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';
import TrialBanner from '@/components/trial-banner';

interface Domain {
    id: number;
    domain: string;
    is_verified: boolean;
    verified_at: string | null;
    ssl_status: 'pending' | 'active' | 'failed';
    ssl_expires_at: string | null;
    created_at: string;
}

interface Props {
    domains: Domain[];
    canUseCustomDomain: boolean;
    subdomain: string | null;
    primaryHost: string;
}

const sslBadge = (status: string) => {
    if (status === 'active') return { cls: 'text-bg-success', icon: 'bi-shield-check', label: 'SSL Active' };
    if (status === 'failed') return { cls: 'text-bg-danger', icon: 'bi-shield-x', label: 'SSL Failed' };
    return { cls: 'text-bg-warning', icon: 'bi-shield-exclamation', label: 'SSL Pending' };
};

export default function DomainsIndex({ domains, canUseCustomDomain, subdomain, primaryHost }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ domain: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/domains', { onSuccess: () => reset('domain') });
    };

    const handleVerify = (id: number) => {
        router.post(`/domains/${id}/verify`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, domain: string) => {
        if (!confirm(`Remove ${domain}?`)) return;
        router.delete(`/domains/${id}`, { preserveScroll: true });
    };

    return (
        <SubscriberLayout
            pageTitle="Domains"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Domains' }]}
        >
            <Head title="Domains" />
            <TrialBanner />

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <div className="d-flex align-items-center gap-3">
                        <div className="icon-box bg-primary bg-opacity-10 text-primary">
                            <i className="bi bi-globe2"></i>
                        </div>
                        <div className="flex-grow-1">
                            <small className="text-secondary text-uppercase fw-semibold">Your Free Subdomain</small>
                            <div className="fw-bold fs-5">
                                {subdomain ? (
                                    <code>{subdomain}.{primaryHost}</code>
                                ) : <span className="text-muted">No slug set</span>}
                            </div>
                        </div>
                        <span className="badge text-bg-success">
                            <i className="bi bi-shield-check me-1"></i>Always Active
                        </span>
                    </div>
                </div>
            </div>

            {!canUseCustomDomain ? (
                <div className="card border-warning border-2 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-lock-fill text-warning" style={{ fontSize: 60 }}></i>
                        <h5 className="fw-bold mt-3">Custom Domains Locked</h5>
                        <p className="text-secondary">Upgrade to <strong>Business</strong> plan to connect your own domain (e.g. yourstore.com).</p>
                        <Link href="/subscription" className="btn btn-warning">
                            <i className="bi bi-arrow-up-circle me-1"></i>Upgrade Plan
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header">
                            <h5 className="card-title mb-0"><i className="bi bi-plus-circle text-primary me-2"></i>Add Custom Domain</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={submit} className="row g-2">
                                <div className="col-md-9">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.domain ? 'is-invalid' : ''}`}
                                        placeholder="yourstore.com"
                                        value={data.domain}
                                        onChange={e => setData('domain', e.target.value.toLowerCase().trim())}
                                    />
                                    {errors.domain && <div className="invalid-feedback">{errors.domain}</div>}
                                    <small className="text-muted">Enter root domain (e.g. <code>yourstore.com</code>) or subdomain (e.g. <code>shop.yourstore.com</code>). No wildcards.</small>
                                </div>
                                <div className="col-md-3">
                                    <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                                        <i className="bi bi-plus-circle me-1"></i>Add Domain
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {domains.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <i className="bi bi-globe text-secondary" style={{ fontSize: 60 }}></i>
                                <h5 className="fw-bold mt-3">No custom domains yet</h5>
                                <p className="text-secondary mb-0">Add your first domain above and follow the DNS setup instructions.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {domains.map(d => {
                                const ssl = sslBadge(d.ssl_status);
                                return (
                                    <div key={d.id} className="col-12">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className={`icon-box ${d.is_verified ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                                            <i className={`bi ${d.is_verified ? 'bi-globe-americas' : 'bi-globe'}`}></i>
                                                        </div>
                                                        <div>
                                                            <h5 className="fw-bold mb-1">{d.domain}</h5>
                                                            <div className="d-flex gap-2">
                                                                {d.is_verified ? (
                                                                    <span className="badge text-bg-success"><i className="bi bi-check-circle-fill me-1"></i>Verified</span>
                                                                ) : (
                                                                    <span className="badge text-bg-warning"><i className="bi bi-clock me-1"></i>Pending Verification</span>
                                                                )}
                                                                <span className={`badge ${ssl.cls}`}>
                                                                    <i className={`bi ${ssl.icon} me-1`}></i>{ssl.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        {!d.is_verified && (
                                                            <button onClick={() => handleVerify(d.id)} className="btn btn-sm btn-success">
                                                                <i className="bi bi-arrow-repeat me-1"></i>Verify Now
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete(d.id, d.domain)} className="btn btn-sm btn-outline-danger">
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {!d.is_verified && (
                                                    <div className="alert alert-info mb-0">
                                                        <h6 className="fw-bold mb-2"><i className="bi bi-info-circle me-1"></i>DNS Setup Instructions</h6>
                                                        <p className="mb-2">Add this CNAME record at your domain provider (Cloudflare, GoDaddy, etc.):</p>
                                                        <table className="table table-sm bg-white mb-2">
                                                            <thead>
                                                                <tr><th>Type</th><th>Host/Name</th><th>Value/Target</th><th>TTL</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td><code>CNAME</code></td>
                                                                    <td><code>{d.domain.split('.').length > 2 ? d.domain.split('.')[0] : '@'}</code></td>
                                                                    <td><code>{primaryHost}</code></td>
                                                                    <td>3600</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <small className="text-muted">DNS propagation can take up to 24 hours. After updating, click "Verify Now".</small>
                                                    </div>
                                                )}

                                                {d.is_verified && d.ssl_status === 'active' && (
                                                    <div className="text-success small">
                                                        <i className="bi bi-shield-check me-1"></i>
                                                        Visit: <a href={`https://${d.domain}`} target="_blank" rel="noopener" className="fw-medium">https://{d.domain}</a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </SubscriberLayout>
    );
}
