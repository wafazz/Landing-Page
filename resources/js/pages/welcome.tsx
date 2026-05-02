import { Head, Link } from '@inertiajs/react';
import { Button } from 'react-bootstrap';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome to LPage.my" />
            <div className="auth-bg d-flex align-items-center justify-content-center px-3">
                <div className="text-center" style={{ maxWidth: '600px' }}>
                    <h1 className="display-3 fw-bold text-dark mb-3">LPage.my</h1>
                    <p className="lead text-secondary mb-4">
                        Build beautiful landing pages with drag &amp; drop. Sell products. Print AWB.
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Link href="/login">
                            <Button variant="primary" size="lg">
                                <i className="bi bi-box-arrow-in-right me-2"></i>Login
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline-primary" size="lg">
                                <i className="bi bi-rocket-takeoff me-2"></i>Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
