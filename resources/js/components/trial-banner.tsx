import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/models';

export default function TrialBanner() {
    const { props } = usePage<PageProps>();
    const sub = props.subscription;

    if (!sub) return null;

    if (sub.is_trial) {
        const days = sub.days_left;
        const urgent = days <= 3;
        return (
            <div className={`alert ${urgent ? 'alert-warning' : 'alert-info'} d-flex align-items-center justify-content-between mb-3`}>
                <div className="d-flex align-items-center">
                    <i className={`bi ${urgent ? 'bi-exclamation-triangle-fill' : 'bi-hourglass-split'} fs-4 me-3`}></i>
                    <div>
                        <strong>Free Trial — {days} day{days === 1 ? '' : 's'} left</strong>
                        <div className="small">Trial ends on {sub.trial_ends_at}. Upgrade to keep your pages live.</div>
                    </div>
                </div>
                <Link href="/subscription" className="btn btn-primary btn-sm">
                    <i className="bi bi-rocket-takeoff me-1"></i>Upgrade Now
                </Link>
            </div>
        );
    }

    if (sub.in_grace) {
        return (
            <div className="alert alert-danger d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-octagon-fill fs-4 me-3"></i>
                    <div>
                        <strong>Subscription Expired — Grace Period</strong>
                        <div className="small">Renew before your data is locked.</div>
                    </div>
                </div>
                <Link href="/subscription" className="btn btn-danger btn-sm">
                    <i className="bi bi-arrow-clockwise me-1"></i>Renew
                </Link>
            </div>
        );
    }

    return null;
}
