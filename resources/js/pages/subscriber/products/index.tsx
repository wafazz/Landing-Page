import { Head, Link, router } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';
import TrialBanner from '@/components/trial-banner';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number | null;
    images: string[] | null;
    is_active: boolean;
}

interface Props {
    products: Product[];
    limit: { used: number; max: number | null };
}

export default function ProductsIndex({ products, limit }: Props) {
    const atLimit = limit.max !== null && limit.used >= limit.max;

    const handleDelete = (id: number, name: string) => {
        if (!confirm(`Delete product "${name}"?`)) return;
        router.delete(`/products/${id}`, { preserveScroll: true });
    };

    return (
        <SubscriberLayout
            pageTitle="Products"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Products' }]}
        >
            <Head title="Products" />
            <TrialBanner />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <p className="text-secondary mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Using <strong>{limit.used}</strong> of <strong>{limit.max ?? '∞'}</strong> products
                </p>
                {atLimit ? (
                    <Link href="/subscription" className="btn btn-warning">
                        <i className="bi bi-arrow-up-circle me-1"></i>Upgrade for more
                    </Link>
                ) : (
                    <Link href="/products/create" className="btn btn-primary">
                        <i className="bi bi-plus-circle me-1"></i>New Product
                    </Link>
                )}
            </div>

            {products.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-box-seam text-secondary" style={{ fontSize: 60 }}></i>
                        <h5 className="fw-bold mt-3">No products yet</h5>
                        <p className="text-secondary mb-3">Add your first product to start selling.</p>
                        <Link href="/products/create" className="btn btn-primary">
                            <i className="bi bi-plus-circle me-1"></i>Create First Product
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {products.map(p => (
                        <div key={p.id} className="col-md-6 col-lg-4 col-xl-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="position-relative" style={{ paddingTop: '70%', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                                    {p.images && p.images.length > 0 ? (
                                        <img src={p.images[0]} alt={p.name} className="position-absolute top-0 start-0 w-100 h-100" style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className="position-absolute top-50 start-50 translate-middle text-secondary">
                                            <i className="bi bi-image" style={{ fontSize: 48 }}></i>
                                        </div>
                                    )}
                                    {!p.is_active && (
                                        <span className="badge text-bg-secondary position-absolute top-0 end-0 m-2">
                                            <i className="bi bi-eye-slash me-1"></i>Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="card-body">
                                    <h6 className="fw-bold mb-1 text-truncate">{p.name}</h6>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="text-primary fw-bold">RM {p.price}</span>
                                        <small className="text-muted">
                                            {p.stock !== null ? <><i className="bi bi-boxes me-1"></i>{p.stock} stock</> : <i className="bi bi-infinity"></i>}
                                        </small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link href={`/products/${p.id}/edit`} className="btn btn-sm btn-primary flex-grow-1">
                                            <i className="bi bi-pencil me-1"></i>Edit
                                        </Link>
                                        <button onClick={() => handleDelete(p.id, p.name)} className="btn btn-sm btn-outline-danger">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SubscriberLayout>
    );
}
