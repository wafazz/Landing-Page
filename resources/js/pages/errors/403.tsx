import { Head, Link } from '@inertiajs/react';
import { Button } from 'react-bootstrap';

export default function Forbidden() {
    return (
        <>
            <Head title="403 - Forbidden" />
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light px-3">
                <h1 className="display-1 fw-bold text-danger">403</h1>
                <p className="h4 fw-bold text-dark mt-2">Access Forbidden</p>
                <p className="text-secondary">You don't have permission to view this page.</p>
                <Link href="/">
                    <Button variant="primary" className="mt-3">
                        <i className="bi bi-house me-2"></i>Go Home
                    </Button>
                </Link>
            </div>
        </>
    );
}
