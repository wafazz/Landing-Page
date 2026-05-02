import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import type { Package } from '@/types/models';

interface Props {
    packages: Package[];
}

const tagBadge = (t: string) => {
    if (t === 'promo') return 'text-bg-warning';
    if (t === 'trial') return 'text-bg-secondary';
    return 'text-bg-primary';
};

export default function PackagesIndex({ packages }: Props) {
    const handleToggle = (id: number) => {
        router.post(`/admin/packages/${id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, name: string) => {
        if (!confirm(`Delete package "${name}"?`)) return;
        router.delete(`/admin/packages/${id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout
            pageTitle="Packages"
            breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Packages' }]}
        >
            <Head title="Packages" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-secondary mb-0">Manage subscription tiers and feature flags</p>
                <Link href="/admin/packages/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i>New Package
                </Link>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Tag</th>
                                <th>Price</th>
                                <th className="text-center">Pages</th>
                                <th className="text-center">Drag&Drop</th>
                                <th className="text-center">Courier</th>
                                <th className="text-center">AWB</th>
                                <th className="text-center">Custom Domain</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="fw-medium">{p.name}</div>
                                        <small className="text-muted">{p.slug}</small>
                                    </td>
                                    <td><span className={`badge ${tagBadge(p.tag)}`}>{p.tag}</span></td>
                                    <td className="fw-medium">RM {p.price}<small className="text-muted">/{p.billing_cycle === 'yearly' ? 'yr' : 'mo'}</small></td>
                                    <td className="text-center">{p.max_landing_pages}</td>
                                    <td className="text-center"><i className={`bi ${p.can_use_drag_drop ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'}`}></i></td>
                                    <td className="text-center"><i className={`bi ${p.can_connect_courier ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'}`}></i></td>
                                    <td className="text-center"><i className={`bi ${p.can_print_awb ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'}`}></i></td>
                                    <td className="text-center"><i className={`bi ${p.can_use_custom_domain ? 'bi-check-circle text-success' : 'bi-x-circle text-muted'}`}></i></td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(p.id)}
                                            className={`btn btn-sm ${p.is_active ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                            title="Toggle active"
                                        >
                                            <i className={`bi ${p.is_active ? 'bi-toggle-on' : 'bi-toggle-off'} me-1`}></i>
                                            {p.is_active ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="text-end">
                                        <Link href={`/admin/packages/${p.id}/edit`} className="btn btn-sm btn-outline-primary me-1">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        {p.tag !== 'trial' && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(p.id, p.name)}
                                                className="btn btn-sm btn-outline-danger"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
