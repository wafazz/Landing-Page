import { Head, Link } from '@inertiajs/react';
import { Button } from 'react-bootstrap';

export default function ServerError() {
    return (
        <>
            <Head title="500 - Server Error" />
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light px-3">
                <h1 className="display-1 fw-bold text-danger">500</h1>
                <p className="h4 fw-bold text-dark mt-2">Something went wrong</p>
                <p className="text-secondary">Our team has been notified. Please try again later.</p>
                <Link href="/">
                    <Button variant="primary" className="mt-3">
                        <i className="bi bi-house me-2"></i>Go Home
                    </Button>
                </Link>
            </div>
        </>
    );
}
