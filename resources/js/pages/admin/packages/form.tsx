import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import type { Package } from '@/types/models';

interface Props {
    package: Package | null;
}

export default function PackageForm({ package: pkg }: Props) {
    const isEdit = !!pkg;

    const { data, setData, post, put, processing, errors } = useForm({
        name: pkg?.name ?? '',
        description: pkg?.description ?? '',
        price: pkg?.price ?? '0',
        billing_cycle: pkg?.billing_cycle ?? 'monthly',
        tag: pkg?.tag ?? 'normal',
        max_landing_pages: pkg?.max_landing_pages ?? 1,
        max_products: pkg?.max_products ?? null as number | null,
        can_use_tinymce: pkg?.can_use_tinymce ?? true,
        can_use_drag_drop: pkg?.can_use_drag_drop ?? false,
        can_connect_courier: pkg?.can_connect_courier ?? false,
        can_print_awb: pkg?.can_print_awb ?? false,
        can_use_custom_domain: pkg?.can_use_custom_domain ?? false,
        sort_order: 0,
        is_active: pkg?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) put(`/admin/packages/${pkg!.id}`);
        else post('/admin/packages');
    };

    return (
        <AdminLayout
            pageTitle={isEdit ? 'Edit Package' : 'New Package'}
            breadcrumb={[
                { label: 'Home', href: '/admin/dashboard' },
                { label: 'Packages', href: '/admin/packages' },
                { label: isEdit ? 'Edit' : 'New' },
            ]}
        >
            <Head title={isEdit ? 'Edit Package' : 'New Package'} />

            <form onSubmit={submit}>
                <div className="row g-3">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header">
                                <h5 className="card-title mb-0"><i className="bi bi-box text-primary me-2"></i>Basic Info</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Name *</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows={2} value={data.description ?? ''} onChange={e => setData('description', e.target.value)}></textarea>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Price (RM) *</label>
                                        <input type="number" step="0.01" min="0" className={`form-control ${errors.price ? 'is-invalid' : ''}`} value={data.price} onChange={e => setData('price', e.target.value)} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Billing</label>
                                        <select className="form-select" value={data.billing_cycle} onChange={e => setData('billing_cycle', e.target.value as 'monthly' | 'yearly')}>
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Tag</label>
                                        <select className="form-select" value={data.tag} onChange={e => setData('tag', e.target.value as 'normal' | 'promo' | 'trial')}>
                                            <option value="normal">Normal</option>
                                            <option value="promo">Promo</option>
                                            <option value="trial">Trial</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-header">
                                <h5 className="card-title mb-0"><i className="bi bi-toggles text-success me-2"></i>Feature Flags</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="bi bi-file-earmark-text me-1"></i>Max Landing Pages *</label>
                                        <input type="number" min="1" className="form-control" value={data.max_landing_pages} onChange={e => setData('max_landing_pages', parseInt(e.target.value) || 1)} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="bi bi-box-seam me-1"></i>Max Products <small className="text-muted">(blank = unlimited)</small></label>
                                        <input type="number" min="0" className="form-control" value={data.max_products ?? ''} onChange={e => setData('max_products', e.target.value === '' ? null : parseInt(e.target.value))} />
                                    </div>
                                </div>
                                <hr />
                                <div className="row g-2">
                                    {[
                                        { key: 'can_use_tinymce', label: 'TinyMCE Editor', icon: 'bi-pencil-square' },
                                        { key: 'can_use_drag_drop', label: 'Drag & Drop Builder', icon: 'bi-grid-1x2' },
                                        { key: 'can_connect_courier', label: 'Courier Integration', icon: 'bi-truck' },
                                        { key: 'can_print_awb', label: 'AWB Printing', icon: 'bi-printer' },
                                        { key: 'can_use_custom_domain', label: 'Custom Domain', icon: 'bi-globe' },
                                    ].map(f => (
                                        <div key={f.key} className="col-md-6">
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={f.key}
                                                    checked={(data as any)[f.key]}
                                                    onChange={e => setData(f.key as any, e.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor={f.key}>
                                                    <i className={`bi ${f.icon} text-secondary me-1`}></i>{f.label}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header">
                                <h5 className="card-title mb-0"><i className="bi bi-gear text-info me-2"></i>Visibility</h5>
                            </div>
                            <div className="card-body">
                                <div className="form-check form-switch mb-3">
                                    <input type="checkbox" className="form-check-input" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="is_active">
                                        Active <small className="text-muted">(visible to subscribers)</small>
                                    </label>
                                </div>
                                <div className="mb-0">
                                    <label className="form-label">Sort Order</label>
                                    <input type="number" className="form-control" value={data.sort_order} onChange={e => setData('sort_order', parseInt(e.target.value) || 0)} />
                                </div>
                            </div>
                        </div>

                        <div className="d-grid gap-2 mt-3">
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                <i className="bi bi-check-circle me-1"></i>
                                {processing ? 'Saving...' : (isEdit ? 'Update Package' : 'Create Package')}
                            </button>
                            <Link href="/admin/packages" className="btn btn-outline-secondary">
                                <i className="bi bi-arrow-left me-1"></i>Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
