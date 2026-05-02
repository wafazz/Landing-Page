import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Props {
    title: string;
    value: number | string;
    icon: string;
    color?: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary';
    href?: string;
    suffix?: string;
    prefix?: string;
    animateCount?: boolean;
    trend?: { value: number; label?: string };
}

export default function SmallBox({
    title,
    value,
    icon,
    color = 'primary',
    href,
    suffix = '',
    prefix = '',
    animateCount = true,
    trend,
}: Props) {
    const [display, setDisplay] = useState<string | number>(animateCount ? 0 : value);

    useEffect(() => {
        if (!animateCount || typeof value !== 'number') {
            setDisplay(value);
            return;
        }
        const target = value;
        const duration = 900;
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [value, animateCount]);

    const inner = (
        <div className={`card border-0 shadow-sm h-100 stat-card stat-${color}`}>
            <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                    <p className="text-secondary text-uppercase small fw-semibold mb-1" style={{ letterSpacing: 0.5 }}>
                        {title}
                    </p>
                    <h3 className="fw-bold mb-1">
                        {prefix}{display}{suffix}
                    </h3>
                    {trend && (
                        <small className={`fw-medium ${trend.value >= 0 ? 'text-success' : 'text-danger'}`}>
                            <i className={`bi ${trend.value >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'} me-1`}></i>
                            {Math.abs(trend.value)}% {trend.label ?? 'vs last week'}
                        </small>
                    )}
                </div>
                <div className={`icon-box bg-${color} bg-opacity-10 text-${color}`}>
                    <i className={`bi ${icon}`}></i>
                </div>
            </div>
            {href && (
                <Link href={href} className={`card-footer bg-${color} bg-opacity-10 border-0 text-${color} fw-medium small text-decoration-none d-flex align-items-center justify-content-between`}>
                    <span>View details</span>
                    <i className="bi bi-chevron-right"></i>
                </Link>
            )}
        </div>
    );

    return inner;
}
