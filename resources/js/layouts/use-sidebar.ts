import { useEffect, useState, useCallback } from 'react';

const MOBILE_BREAKPOINT = 992;

export function useSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggle = useCallback(() => {
        if (window.innerWidth >= MOBILE_BREAKPOINT) {
            setCollapsed(c => !c);
        } else {
            setMobileOpen(o => !o);
        }
    }, []);

    const closeMobile = useCallback(() => setMobileOpen(false), []);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= MOBILE_BREAKPOINT) setMobileOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const cls = document.body.classList;
        cls.toggle('sidebar-collapse', collapsed);
        cls.toggle('sidebar-open', mobileOpen);
        return () => {
            cls.remove('sidebar-collapse');
            cls.remove('sidebar-open');
        };
    }, [collapsed, mobileOpen]);

    return { collapsed, mobileOpen, toggle, closeMobile };
}
