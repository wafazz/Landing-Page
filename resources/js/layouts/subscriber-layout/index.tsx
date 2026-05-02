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
    { label: 'Dashboard', href: '/dashboard', icon: 'bi-speedometer2' },
    { label: 'Landing Pages', href: '/pages', icon: 'bi-file-earmark-text' },
    { label: 'Products', href: '/products', icon: 'bi-box-seam' },
    { label: 'Orders', href: '/orders', icon: 'bi-bag-check' },
    { label: 'Analytics', href: '/analytics', icon: 'bi-graph-up' },
    { label: 'Domains', href: '/domains', icon: 'bi-globe' },
    { label: 'Payment Gateway', href: '/payment-settings', icon: 'bi-credit-card' },
    { label: 'Courier', href: '/courier-settings', icon: 'bi-truck' },
    { label: 'Notifications', href: '/notification-prefs', icon: 'bi-bell' },
    { label: 'Subscription', href: '/subscription', icon: 'bi-star' },
];

export default function SubscriberLayout({ children, pageTitle, breadcrumb }: Props) {
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
            <Sidebar items={menu} brand="LPage.my" brandHref="/dashboard" logo={props.siteLogo} />

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
