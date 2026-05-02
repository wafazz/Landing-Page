import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import SubscriberLayout from '@/layouts/subscriber-layout';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number | null;
    description: string | null;
    images: string[] | null;
    weight_kg: string | null;
    is_active: boolean;
}

interface PageOption { id: number; title: string; }

interface Props {
    product: Product | null;
    attached_pages: number[];
    pages: PageOption[];
}

export default function ProductForm({ product, attached_pages, pages }: Props) {
    const isEdit = !!product;
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);

    const { data, setData, processing, errors } = useForm({
        name: product?.name ?? '',
        price: product?.price ?? '0',
        stock: product?.stock?.toString() ?? '',
        description: product?.description ?? '',
        weight_kg: product?.weight_kg ?? '',
        is_active: product?.is_active ?? true,
        new_images: [] as File[],
        attached_pages: attached_pages,
        _method: isEdit ? 'PUT' : 'POST',
    });

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files);
        setData('new_images', arr);
        setPreviews(arr.map(f => URL.createObjectURL(f)));
    };

    const togglePage = (id: number) => {
        const current = data.attached_pages;
        if (current.includes(id)) setData('attached_pages', current.filter(x => x !== id));
        else setData('attached_pages', [...current, id]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/products/${product!.id}` : '/products';
        router.post(url, data as Record<string, unknown>, { forceFormData: true });
    };

    return (
        <SubscriberLayout
            pageTitle={isEdit ? 'Edit Product' : 'New Product'}
            breadcrumb={[
                { label: 'Home', href: '/dashboard' },
                { label: 'Products', href: '/products' },
                { label: isEdit ? 'Edit' : 'New' },
            ]}
        >
            <Head title={isEdit ? `Edit: ${product?.name}` : 'New Product'} />

            <form onSubmit={submit}>
                <div className="row g-3">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-box-seam text-primary me-2"></i>Details</h5></div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Name *</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Price (RM) *</label>
                                        <input type="number" step="0.01" min="0" className="form-control" value={data.price} onChange={e => setData('price', e.target.value)} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Stock <small className="text-muted">(blank = ∞)</small></label>
                                        <input type="number" min="0" className="form-control" value={data.stock} onChange={e => setData('stock', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Weight (kg)</label>
                                        <input type="number" step="0.01" min="0" className="form-control" value={data.weight_kg} onChange={e => setData('weight_kg', e.target.value)} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows={4} value={data.description ?? ''} onChange={e => setData('description', e.target.value)}></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-images text-success me-2"></i>Images</h5></div>
                            <div className="card-body">
                                {existingImages.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {existingImages.map((url, i) => (
                                            <div key={i} className="position-relative">
                                                <img src={url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                                                <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{ padding: '2px 6px' }} onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))}>
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <input type="file" multiple accept="image/*" className="form-control" onChange={e => handleFiles(e.target.files)} />
                                {previews.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        {previews.map((url, i) => (
                                            <img key={i} src={url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-file-earmark-text text-info me-2"></i>Attach to Pages</h5></div>
                            <div className="card-body">
                                {pages.length === 0 ? (
                                    <p className="text-secondary mb-0">No landing pages yet. <Link href="/pages/create">Create one</Link>.</p>
                                ) : (
                                    <div className="row g-2">
                                        {pages.map(p => (
                                            <div key={p.id} className="col-md-6">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id={`page-${p.id}`}
                                                        checked={data.attached_pages.includes(p.id)}
                                                        onChange={() => togglePage(p.id)}
                                                    />
                                                    <label className="form-check-label" htmlFor={`page-${p.id}`}>
                                                        <i className="bi bi-file-earmark me-1"></i>{p.title}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-gear text-secondary me-2"></i>Visibility</h5></div>
                            <div className="card-body">
                                <div className="form-check form-switch">
                                    <input type="checkbox" className="form-check-input" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="is_active">
                                        {data.is_active ? <><i className="bi bi-eye text-success me-1"></i>Active</> : <><i className="bi bi-eye-slash text-secondary me-1"></i>Inactive</>}
                                    </label>
                                </div>
                            </div>
                            <div className="card-footer bg-white">
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        <i className="bi bi-check-circle me-1"></i>
                                        {processing ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
                                    </button>
                                    <Link href="/products" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-1"></i>Cancel
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </SubscriberLayout>
    );
}
