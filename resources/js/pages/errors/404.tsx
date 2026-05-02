import { Head, Link } from '@inertiajs/react';
import { Button } from 'react-bootstrap';

export default function NotFound() {
    return (
        <>
            <Head title="404 - Not Found" />
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light px-3">
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <p className="h4 fw-bold text-dark mt-2">Page Not Found</p>
                <p className="text-secondary">The page you're looking for doesn't exist.</p>
                <Link href="/">
                    <Button variant="primary" className="mt-3">
                        <i className="bi bi-house me-2"></i>Go Home
                    </Button>
                </Link>
            </div>
        </>
    );
}
