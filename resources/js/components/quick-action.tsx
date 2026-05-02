import { Link } from '@inertiajs/react';

interface Props {
    title: string;
    description: string;
    icon: string;
    color: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary';
    href: string;
}

export default function QuickAction({ title, description, icon, color, href }: Props) {
    return (
        <Link href={href} className="card border-0 shadow-sm h-100 quick-action-card">
            <div className="card-body d-flex align-items-center gap-3">
                <div className={`icon-circle bg-${color} bg-opacity-10 text-${color}`}>
                    <i className={`bi ${icon}`}></i>
                </div>
                <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">{title}</h6>
                    <small className="text-secondary">{description}</small>
                </div>
                <i className={`bi bi-chevron-right text-${color}`}></i>
            </div>
        </Link>
    );
}
