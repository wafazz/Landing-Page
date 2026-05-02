import { Link, usePage } from '@inertiajs/react';

export interface MenuItem {
    label: string;
    href: string;
    icon: string;
    badge?: { text: string; color: string };
    children?: MenuItem[];
}

interface Props {
    items: MenuItem[];
    brand: string;
    brandHref: string;
    logo?: string | null;
}

export default function Sidebar({ items, brand, brandHref, logo }: Props) {
    const { url } = usePage();

    const isActive = (href: string) => url === href || url.startsWith(href + '/');

    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            <div className="sidebar-brand">
                <Link href={brandHref} className="brand-link d-flex align-items-center">
                    {logo ? (
                        <img src={logo} alt="Logo" className="brand-image opacity-75 shadow" style={{ maxHeight: 32 }} />
                    ) : (
                        <i className="bi bi-rocket-takeoff-fill text-primary fs-4 me-2"></i>
                    )}
                    <span className="brand-text fw-bold">{brand}</span>
                </Link>
            </div>

            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul
                        className="nav sidebar-menu flex-column"
                        data-lte-toggle="treeview"
                        role="menu"
                    >
                        {items.map((item, i) => (
                            <li key={i} className="nav-item">
                                <Link
                                    href={item.href}
                                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                                >
                                    <i className={`nav-icon bi ${item.icon}`}></i>
                                    <p>
                                        {item.label}
                                        {item.badge && (
                                            <span className={`badge text-bg-${item.badge.color} ms-auto`}>
                                                {item.badge.text}
                                            </span>
                                        )}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
