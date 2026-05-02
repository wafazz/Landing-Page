import { Head } from '@inertiajs/react';
import { Card, Button } from 'react-bootstrap';

interface Order {
    order_number: string;
    total: string;
    user_id: number;
    landing_page_id: number;
}

export default function CheckoutFailed({ order }: { order: Order }) {
    return (
        <div className="checkout-bg min-vh-100 py-5 d-flex align-items-center">
            <Head title={`Payment Failed — ${order.order_number}`} />
            <div className="container" style={{ maxWidth: 560 }}>
                <Card className="shadow-sm border-0 text-center">
                    <Card.Body className="p-5">
                        <div className="mb-3">
                            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: 64 }}></i>
                        </div>
                        <h2 className="fw-bold mb-2">Payment Failed</h2>
                        <p className="text-muted mb-4">
                            Order <strong>{order.order_number}</strong> could not be completed.
                            <br />No charge was made.
                        </p>
                        <Button variant="primary" href="javascript:history.back()">
                            <i className="bi bi-arrow-left me-2"></i>Try Again
                        </Button>
                    </Card.Body>
                </Card>
            </div>
            <style>{`.checkout-bg{background:linear-gradient(135deg,#f5f7fa 0%,#e6e9f0 100%)}`}</style>
        </div>
    );
}
