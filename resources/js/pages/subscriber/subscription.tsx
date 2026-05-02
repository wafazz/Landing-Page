import { Head } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';
import type { Package } from '@/types/models';

interface CurrentSub {
    id: number;
    status: string;
    package: Package;
    amount: string;
    starts_at: string | null;
    ends_at: string | null;
    trial_ends_at: string | null;
    days_left: number;
    is_trial: boolean;
}

interface Props {
    current: CurrentSub | null;
    packages: Package[];
}

const statusBadge = (s: string) => {
    if (s === 'active') return { cls: 'text-bg-success', icon: 'bi-check-circle-fill', label: 'Active' };
    if (s === 'trial') return { cls: 'text-bg-info', icon: 'bi-hourglass-split', label: 'Trial' };
    if (s === 'pending') return { cls: 'text-bg-warning', icon: 'bi-clock', label: 'Pending' };
    if (s === 'expired') return { cls: 'text-bg-danger', icon: 'bi-x-circle-fill', label: 'Expired' };
    return { cls: 'text-bg-secondary', icon: 'bi-dash-circle', label: s };
};

const featureRow = (label: string, value: string | boolean | number | null, icon: string) => (
    <li className="d-flex align-items-center mb-2">
        <i className={`bi ${value === false ? 'bi-x-circle text-danger' : 'bi-check-circle text-success'} me-2`}></i>
        <i className={`bi ${icon} text-secondary me-2`}></i>
        <span>{label}: <strong>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value ?? 'Unlimited'}</strong></span>
    </li>
);

export default function SubscriptionPage({ current, packages }: Props) {
    return (
        <SubscriberLayout
            pageTitle="Subscription"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Subscription' }]}
        >
            <Head title="Subscription" />

            {current && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="d-flex align-items-center">
                                <div className="icon-box bg-primary bg-opacity-10 text-primary me-3">
                                    <i className="bi bi-star-fill"></i>
                                </div>
                                <div>
                                    <small className="text-secondary text-uppercase fw-semibold">Current Plan</small>
                                    <h4 className="fw-bold mb-1">{current.package.name}</h4>
                                    <span className={`badge ${statusBadge(current.status).cls}`}>
                                        <i className={`bi ${statusBadge(current.status).icon} me-1`}></i>
                                        {statusBadge(current.status).label}
                                    </span>
                                </div>
                            </div>
                            <div className="text-end">
                                <small className="text-secondary">Days remaining</small>
                                <h2 className="fw-bold mb-0 text-primary">{current.days_left}</h2>
                                <small className="text-muted">
                                    Ends {current.is_trial ? current.trial_ends_at : current.ends_at}
                                </small>
                            </div>
                        </div>

                        <hr />

                        <ul className="list-unstyled row g-2 mb-0">
                            <li className="col-md-6">{featureRow('Landing Pages', current.package.max_landing_pages, 'bi-file-earmark-text')}</li>
                            <li className="col-md-6">{featureRow('Products', current.package.max_products, 'bi-box-seam')}</li>
                            <li className="col-md-6">{featureRow('Drag & Drop Builder', current.package.can_use_drag_drop, 'bi-grid-1x2')}</li>
                            <li className="col-md-6">{featureRow('Custom Domain', current.package.can_use_custom_domain, 'bi-globe')}</li>
                            <li className="col-md-6">{featureRow('Courier Integration', current.package.can_connect_courier, 'bi-truck')}</li>
                            <li className="col-md-6">{featureRow('AWB Printing', current.package.can_print_awb, 'bi-printer')}</li>
                        </ul>
                    </div>
                </div>
            )}

            <div className="d-flex align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                    <i className="bi bi-collection text-primary me-2"></i>
                    {current?.is_trial ? 'Upgrade Your Plan' : 'Available Plans'}
                </h5>
            </div>

            <div className="row g-3">
                {packages.map(pkg => {
                    const isCurrent = current?.package?.slug === pkg.slug && !current?.is_trial;
                    return (
                        <div key={pkg.id} className="col-md-6 col-lg-4">
                            <div className={`card border-0 shadow-sm h-100 ${pkg.tag === 'promo' ? 'border-warning border-2' : ''}`}>
                                {pkg.tag === 'promo' && (
                                    <div className="bg-warning text-dark text-center fw-bold py-1 small">
                                        <i className="bi bi-star-fill me-1"></i>PROMO
                                    </div>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <div className="text-center mb-3">
                                        <i className={`bi ${pkg.slug === 'starter' ? 'bi-rocket' : pkg.slug === 'pro' ? 'bi-rocket-takeoff' : pkg.slug === 'business' ? 'bi-rocket-takeoff-fill' : 'bi-box'} display-4 text-primary`}></i>
                                        <h4 className="fw-bold mt-2 mb-0">{pkg.name}</h4>
                                        <small className="text-muted">{pkg.description}</small>
                                    </div>
                                    <div className="text-center mb-3">
                                        <span className="display-5 fw-bold text-primary">RM {pkg.price}</span>
                                        <small className="text-muted">/{pkg.billing_cycle === 'yearly' ? 'year' : 'month'}</small>
                                    </div>
                                    <ul className="list-unstyled flex-grow-1">
                                        <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>{pkg.max_landing_pages} Landing Pages</li>
                                        <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>{pkg.max_products ?? 'Unlimited'} Products</li>
                                        <li className="mb-2"><i className={`bi ${pkg.can_use_drag_drop ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'} me-2`}></i>Drag &amp; Drop Builder</li>
                                        <li className="mb-2"><i className={`bi ${pkg.can_connect_courier ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'} me-2`}></i>Courier Integration</li>
                                        <li className="mb-2"><i className={`bi ${pkg.can_print_awb ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'} me-2`}></i>AWB Printing</li>
                                        <li className="mb-2"><i className={`bi ${pkg.can_use_custom_domain ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'} me-2`}></i>Custom Domain</li>
                                    </ul>
                                    <button
                                        type="button"
                                        className={`btn ${isCurrent ? 'btn-success' : 'btn-primary'} w-100`}
                                        disabled={isCurrent}
                                    >
                                        {isCurrent ? (
                                            <><i className="bi bi-check-circle-fill me-1"></i>Current Plan</>
                                        ) : (
                                            <><i className="bi bi-cart-plus me-1"></i>Subscribe</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </SubscriberLayout>
    );
}
