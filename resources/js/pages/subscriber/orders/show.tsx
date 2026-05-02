import { Head, Link, router } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';

interface Item {
    id: number;
    product_name: string;
    qty: number;
    price: string;
    subtotal: string;
}

interface Shipment {
    id: number;
    courier: string;
    awb_number: string | null;
    tracking_url: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    shipping_address: string | null;
    shipping_city: string | null;
    shipping_postcode: string | null;
    shipping_state: string | null;
    subtotal: string;
    shipping_fee: string;
    total: string;
    payment_status: string;
    payment_gateway: string | null;
    gateway_ref: string | null;
    paid_at: string | null;
    fulfillment_status: string;
    note: string | null;
    created_at: string;
    items: Item[];
    landing_page: { id: number; title: string; slug: string } | null;
    shipment: Shipment | null;
}

interface Props {
    order: Order;
    can_connect_courier: boolean;
    can_print_awb: boolean;
}

export default function OrderShow({ order, can_connect_courier, can_print_awb }: Props) {
    const createShipment = () => router.post(`/orders/${order.id}/shipment`, {}, { preserveScroll: true });
    const trackShipment = () => router.post(`/orders/${order.id}/shipment/track`, {}, { preserveScroll: true });

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            pending: 'text-bg-secondary',
            created: 'text-bg-info',
            picked_up: 'text-bg-primary',
            in_transit: 'text-bg-warning',
            delivered: 'text-bg-success',
            failed: 'text-bg-danger',
        };
        return map[s] || 'text-bg-secondary';
    };

    return (
        <SubscriberLayout
            pageTitle={`Order ${order.order_number}`}
            breadcrumb={[
                { label: 'Home', href: '/dashboard' },
                { label: 'Orders', href: '/orders' },
                { label: order.order_number },
            ]}
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="row g-3">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-receipt text-primary me-2"></i>Order Items</h5></div>
                        <div className="card-body p-0">
                            <table className="table mb-0">
                                <thead className="table-light">
                                    <tr><th>Product</th><th className="text-center">Qty</th><th className="text-end">Price</th><th className="text-end">Subtotal</th></tr>
                                </thead>
                                <tbody>
                                    {order.items.map(it => (
                                        <tr key={it.id}>
                                            <td>{it.product_name}</td>
                                            <td className="text-center">{it.qty}</td>
                                            <td className="text-end">RM {it.price}</td>
                                            <td className="text-end fw-semibold">RM {it.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr><td colSpan={3} className="text-end">Subtotal</td><td className="text-end">RM {order.subtotal}</td></tr>
                                    <tr><td colSpan={3} className="text-end">Shipping</td><td className="text-end">RM {order.shipping_fee}</td></tr>
                                    <tr><td colSpan={3} className="text-end fw-bold">Total</td><td className="text-end fw-bold text-primary">RM {order.total}</td></tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {order.note && (
                        <div className="card border-0 shadow-sm">
                            <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-sticky text-warning me-2"></i>Customer Note</h5></div>
                            <div className="card-body"><p className="mb-0">{order.note}</p></div>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header"><h6 className="card-title mb-0"><i className="bi bi-credit-card text-success me-2"></i>Payment</h6></div>
                        <div className="card-body">
                            <p className="mb-1"><small className="text-muted">Status</small></p>
                            <p className="fw-bold mb-2 text-capitalize">{order.payment_status}</p>
                            {order.payment_gateway && (
                                <p className="mb-1"><small className="text-muted">Gateway</small><br />{order.payment_gateway}</p>
                            )}
                            {order.gateway_ref && (
                                <p className="mb-1"><small className="text-muted">Reference</small><br /><code className="small">{order.gateway_ref}</code></p>
                            )}
                            {order.paid_at && (
                                <p className="mb-0"><small className="text-muted">Paid at</small><br />{order.paid_at}</p>
                            )}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header"><h6 className="card-title mb-0"><i className="bi bi-person text-info me-2"></i>Customer</h6></div>
                        <div className="card-body">
                            <p className="fw-bold mb-1">{order.customer_name}</p>
                            <p className="mb-1"><i className="bi bi-envelope me-1"></i>{order.customer_email}</p>
                            {order.customer_phone && <p className="mb-0"><i className="bi bi-telephone me-1"></i>{order.customer_phone}</p>}
                        </div>
                    </div>

                    {order.shipping_address && (
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header"><h6 className="card-title mb-0"><i className="bi bi-geo-alt text-warning me-2"></i>Shipping</h6></div>
                            <div className="card-body small">
                                <p className="mb-0">{order.shipping_address}</p>
                                <p className="mb-0">{order.shipping_postcode} {order.shipping_city}</p>
                                <p className="mb-0">{order.shipping_state}</p>
                            </div>
                        </div>
                    )}

                    {can_connect_courier && order.payment_status === 'paid' && (
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h6 className="card-title mb-0"><i className="bi bi-truck text-danger me-2"></i>Shipment</h6>
                                {order.shipment && (
                                    <span className={`badge ${statusBadge(order.shipment.status)} text-uppercase`}>{order.shipment.status.replace('_', ' ')}</span>
                                )}
                            </div>
                            <div className="card-body">
                                {order.shipment ? (
                                    <>
                                        <p className="mb-1"><small className="text-muted">Courier</small><br /><strong className="text-uppercase">{order.shipment.courier}</strong></p>
                                        {order.shipment.awb_number && (
                                            <p className="mb-1"><small className="text-muted">AWB</small><br /><code className="small">{order.shipment.awb_number}</code></p>
                                        )}
                                        {order.shipment.tracking_url && (
                                            <p className="mb-2"><a href={order.shipment.tracking_url} target="_blank" rel="noopener" className="small"><i className="bi bi-box-arrow-up-right me-1"></i>Track on courier site</a></p>
                                        )}
                                        <div className="d-grid gap-2">
                                            <button onClick={trackShipment} className="btn btn-sm btn-outline-primary">
                                                <i className="bi bi-arrow-clockwise me-1"></i>Refresh Status
                                            </button>
                                            {can_print_awb && order.shipment.awb_number && (
                                                <a href={`/orders/${order.id}/awb`} target="_blank" rel="noopener" className="btn btn-sm btn-primary">
                                                    <i className="bi bi-printer me-1"></i>Print AWB
                                                </a>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-muted small mb-2">No shipment created yet.</p>
                                        <button onClick={createShipment} className="btn btn-sm btn-danger w-100">
                                            <i className="bi bi-plus-circle me-1"></i>Create Shipment
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <Link href="/orders" className="btn btn-outline-secondary w-100">
                        <i className="bi bi-arrow-left me-1"></i>Back to Orders
                    </Link>
                </div>
            </div>
        </SubscriberLayout>
    );
}
