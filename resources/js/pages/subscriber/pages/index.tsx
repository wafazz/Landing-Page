import { Head, Link, router } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';
import TrialBanner from '@/components/trial-banner';

interface Page {
    id: number;
    title: string;
    slug: string;
    editor_mode: 'tinymce' | 'grapesjs';
    is_published: boolean;
    is_homepage: boolean;
    views_count: number;
    updated_at: string;
}

interface Props {
    pages: Page[];
    limit: { used: number; max: number };
    subdomain: string | null;
}

export default function PagesIndex({ pages, limit, subdomain }: Props) {
    const atLimit = limit.used >= limit.max;

    const handleTogglePublish = (id: number) => {
        router.post(`/pages/${id}/toggle-publish`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, title: string) => {
        if (!confirm(`Delete page "${title}"?`)) return;
        router.delete(`/pages/${id}`, { preserveScroll: true });
    };

    return (
        <SubscriberLayout
            pageTitle="Landing Pages"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Pages' }]}
        >
            <Head title="Landing Pages" />
            <TrialBanner />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <p className="text-secondary mb-0">
                        <i className="bi bi-info-circle me-1"></i>
                        Using <strong>{limit.used}</strong> of <strong>{limit.max}</strong> pages
                    </p>
                </div>
                {atLimit ? (
                    <Link href="/subscription" className="btn btn-warning">
                        <i className="bi bi-arrow-up-circle me-1"></i>Upgrade for more pages
                    </Link>
                ) : (
                    <Link href="/pages/create" className="btn btn-primary">
                        <i className="bi bi-plus-circle me-1"></i>New Page
                    </Link>
                )}
            </div>

            {pages.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-file-earmark-plus text-secondary" style={{ fontSize: 60 }}></i>
                        <h5 className="fw-bold mt-3">No landing pages yet</h5>
                        <p className="text-secondary mb-3">Create your first landing page to start selling.</p>
                        <Link href="/pages/create" className="btn btn-primary">
                            <i className="bi bi-plus-circle me-1"></i>Create First Page
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {pages.map(p => (
                        <div key={p.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-start justify-content-between mb-2">
                                        <div className="icon-box bg-primary bg-opacity-10 text-primary">
                                            <i className={`bi ${p.editor_mode === 'grapesjs' ? 'bi-grid-1x2-fill' : 'bi-pencil-square'}`}></i>
                                        </div>
                                        <div className="d-flex gap-1">
                                            {p.is_homepage && <span className="badge text-bg-info"><i className="bi bi-house-fill me-1"></i>Home</span>}
                                            {p.is_published ? (
                                                <span className="badge text-bg-success"><i className="bi bi-check-circle-fill me-1"></i>Live</span>
                                            ) : (
                                                <span className="badge text-bg-secondary"><i className="bi bi-eye-slash me-1"></i>Draft</span>
                                            )}
                                        </div>
                                    </div>
                                    <h5 className="fw-bold mb-1">{p.title}</h5>
                                    {subdomain && (
                                        <p className="small mb-2">
                                            <code>{subdomain}.lpage.my/{p.slug}</code>
                                        </p>
                                    )}
                                    <div className="d-flex gap-3 small text-secondary mb-3">
                                        <span><i className="bi bi-eye me-1"></i>{p.views_count} views</span>
                                        <span><i className="bi bi-clock me-1"></i>{new Date(p.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link href={`/pages/${p.id}/edit`} className="btn btn-sm btn-primary flex-grow-1">
                                            <i className="bi bi-pencil me-1"></i>Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleTogglePublish(p.id)}
                                            className={`btn btn-sm ${p.is_published ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                                            title={p.is_published ? 'Unpublish' : 'Publish'}
                                        >
                                            <i className={`bi ${p.is_published ? 'bi-eye-slash' : 'bi-broadcast'}`}></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(p.id, p.title)}
                                            className="btn btn-sm btn-outline-danger"
                                            title="Delete"
                                        >
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
