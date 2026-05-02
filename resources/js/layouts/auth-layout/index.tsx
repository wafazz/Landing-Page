import { ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast, Toaster } from '@/components/toast';
import type { PageProps } from '@/types/models';

interface Props {
    children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
    const { props } = usePage<PageProps>();
    const flash = props.flash;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="auth-bg d-flex align-items-center justify-content-center py-5 px-3">
            <Toaster />
            <div className="w-100" style={{ maxWidth: '440px' }}>
                <div className="text-center mb-4">
                    <i className="bi bi-rocket-takeoff-fill text-white" style={{ fontSize: 48 }}></i>
                    <h2 className="text-white fw-bold mt-2 mb-0">LPage.my</h2>
                    <p className="text-white-50 small">Build. Sell. Grow.</p>
                </div>
                <div className="card auth-card shadow-lg border-0">
                    <div className="card-body p-4 p-md-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
