import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';

interface Item {
    product_id: number;
    name: string;
    price: number;
    qty: number;
    image: string | null;
}

interface Props {
    user: { id: number; subscriber_slug: string };
    page: { id: number; title: string; slug: string; checkout_mode: string };
    items: Item[];
    subtotal: number;
    gateway: string | null;
}

export default function CheckoutForm({ user, page, items, subtotal, gateway }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_postcode: '',
        shipping_state: '',
        note: '',
        items: items.map(i => ({ product_id: i.product_id, qty: i.qty })),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/checkout/${user.subscriber_slug}/${page.slug}`);
    };

    return (
        <div className="checkout-bg min-vh-100 py-5">
            <Head title={`Checkout — ${page.title}`} />
            <div className="container" style={{ maxWidth: 960 }}>
                <h1 className="h3 fw-bold mb-4 text-center">Checkout</h1>

                <Row className="g-4">
                    <Col md={7}>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Customer Details</h5>
                                <Form onSubmit={submit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={data.customer_name}
                                            onChange={e => setData('customer_name', e.target.value)}
                                            isInvalid={!!errors.customer_name}
                                            required
                                        />
                                        {errors.customer_name && <Form.Control.Feedback type="invalid">{errors.customer_name}</Form.Control.Feedback>}
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={data.customer_email}
                                                    onChange={e => setData('customer_email', e.target.value)}
                                                    isInvalid={!!errors.customer_email}
                                                    required
                                                />
                                                {errors.customer_email && <Form.Control.Feedback type="invalid">{errors.customer_email}</Form.Control.Feedback>}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Phone</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.customer_phone}
                                                    onChange={e => setData('customer_phone', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <h6 className="fw-bold mt-3 mb-2">Shipping Address</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={data.shipping_address}
                                            onChange={e => setData('shipping_address', e.target.value)}
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.shipping_city}
                                                    onChange={e => setData('shipping_city', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Postcode</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.shipping_postcode}
                                                    onChange={e => setData('shipping_postcode', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>State</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.shipping_state}
                                                    onChange={e => setData('shipping_state', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Note</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={data.note}
                                            onChange={e => setData('note', e.target.value)}
                                        />
                                    </Form.Group>

                                    <Button type="submit" variant="primary" disabled={processing || !gateway} className="w-100 py-2 fw-bold">
                                        {processing ? 'Processing...' : `Pay RM ${subtotal.toFixed(2)}`}
                                    </Button>

                                    {!gateway && (
                                        <div className="alert alert-warning mt-3 mb-0 small">
                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                            Seller has not configured a payment gateway yet.
                                        </div>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={5}>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Order Summary</h5>
                                {items.map(item => (
                                    <div key={item.product_id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} className="me-3" />
                                        )}
                                        <div className="flex-grow-1">
                                            <div className="fw-medium">{item.name}</div>
                                            <small className="text-muted">Qty: {item.qty}</small>
                                        </div>
                                        <div className="fw-bold">RM {(item.price * item.qty).toFixed(2)}</div>
                                    </div>
                                ))}
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal</span>
                                    <span>RM {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-muted">
                                    <span>Shipping</span>
                                    <span>—</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold fs-5">
                                    <span>Total</span>
                                    <span className="text-primary">RM {subtotal.toFixed(2)}</span>
                                </div>
                                {gateway && (
                                    <div className="mt-3 small text-muted text-center">
                                        Secure payment via <span className="text-capitalize fw-medium">{gateway}</span>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
            <style>{`.checkout-bg{background:linear-gradient(135deg,#f5f7fa 0%,#e6e9f0 100%)}`}</style>
        </div>
    );
}
