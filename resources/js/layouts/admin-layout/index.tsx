import { ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster, toast } from '@/components/toast';
import Sidebar, { MenuItem } from '@/layouts/components/sidebar';
import Topbar from '@/layouts/components/topbar';
import Footer from '@/layouts/components/footer';
import { useSidebar } from '@/layouts/use-sidebar';
import type { PageProps } from '@/types/models';

interface Props {
    children: ReactNode;
    pageTitle?: string;
    breadcrumb?: { label: string; href?: string }[];
}

const menu: MenuItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'bi-speedometer2' },
    { label: 'Subscribers', href: '/admin/subscribers', icon: 'bi-people' },
    { label: 'Packages', href: '/admin/packages', icon: 'bi-box' },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'bi-credit-card-2-front' },
    { label: 'Payments', href: '/admin/payments', icon: 'bi-cash-coin' },
    { label: 'Settings', href: '/admin/settings', icon: 'bi-gear' },
];

export default function AdminLayout({ children, pageTitle, breadcrumb }: Props) {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const flash = props.flash;
    const { mobileOpen, toggle, closeMobile } = useSidebar();

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="app-wrapper">
            <Toaster />
            {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile}></div>}
            <Topbar user={user} onToggleSidebar={toggle} />
            <Sidebar items={menu} brand="LPage Admin" brandHref="/admin/dashboard" logo={props.siteLogo} />

            <main className="app-main">
                {pageTitle && (
                    <div className="app-content-header">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-6">
                                    <h3 className="mb-0">{pageTitle}</h3>
                                </div>
                                {breadcrumb && (
                                    <div className="col-sm-6">
                                        <ol className="breadcrumb float-sm-end">
                                            {breadcrumb.map((b, i) => (
                                                <li
                                                    key={i}
                                                    className={`breadcrumb-item ${!b.href ? 'active' : ''}`}
                                                >
                                                    {b.href ? <a href={b.href}>{b.label}</a> : b.label}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="app-content">
                    <div className="container-fluid">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
