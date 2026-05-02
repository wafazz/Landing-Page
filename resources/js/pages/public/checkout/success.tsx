import { Head } from '@inertiajs/react';
import { Card } from 'react-bootstrap';

interface OrderItem {
    id: number;
    product_name: string;
    qty: number;
    price: string;
    subtotal: string;
}

interface Order {
    order_number: string;
    customer_name: string;
    customer_email: string;
    total: string;
    payment_gateway: string;
    paid_at: string | null;
    items: OrderItem[];
}

export default function CheckoutSuccess({ order }: { order: Order }) {
    return (
        <div className="checkout-bg min-vh-100 py-5 d-flex align-items-center">
            <Head title={`Order Confirmed — ${order.order_number}`} />
            <div className="container" style={{ maxWidth: 640 }}>
                <Card className="shadow-sm border-0 text-center">
                    <Card.Body className="p-5">
                        <div className="mb-3">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 64 }}></i>
                        </div>
                        <h2 className="fw-bold mb-2">Payment Successful</h2>
                        <p className="text-muted mb-4">A confirmation has been sent to <strong>{order.customer_email}</strong>.</p>

                        <div className="bg-light rounded p-3 text-start mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Order Number</span>
                                <span className="fw-bold">{order.order_number}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total Paid</span>
                                <span className="fw-bold text-success">RM {order.total}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Payment Method</span>
                                <span className="text-capitalize">{order.payment_gateway}</span>
                            </div>
                            <hr />
                            {order.items.map(item => (
                                <div key={item.id} className="d-flex justify-content-between small">
                                    <span>{item.product_name} × {item.qty}</span>
                                    <span>RM {item.subtotal}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-muted small mb-0">Thank you for your purchase!</p>
                    </Card.Body>
                </Card>
            </div>
            <style>{`.checkout-bg{background:linear-gradient(135deg,#f5f7fa 0%,#e6e9f0 100%)}`}</style>
        </div>
    );
}
