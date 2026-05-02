import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import SubscriberLayout from '@/layouts/subscriber-layout';
import TinyMCEEditor from '@/components/tinymce-editor';
import GrapesJSEditor from '@/components/grapesjs-editor';

interface PageData {
    id: number;
    title: string;
    slug: string;
    editor_mode: 'tinymce' | 'grapesjs';
    content_html: string | null;
    grapesjs_data: Record<string, unknown> | null;
    checkout_mode: 'single' | 'cart';
    seo_title: string | null;
    seo_description: string | null;
    og_image: string | null;
    is_published: boolean;
    is_homepage: boolean;
}

interface Props {
    page: PageData | null;
    features: { can_use_drag_drop: boolean };
}

export default function PageForm({ page, features }: Props) {
    const isEdit = !!page;
    const [activeTab, setActiveTab] = useState<'editor' | 'seo' | 'settings'>('editor');

    const { data, setData, post, put, processing, errors } = useForm({
        title:           page?.title ?? '',
        editor_mode:     (page?.editor_mode ?? 'tinymce') as 'tinymce' | 'grapesjs',
        content_html:    page?.content_html ?? '<h1>Welcome to my page</h1><p>Start editing this content...</p>',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        grapesjs_data:   (page?.grapesjs_data ?? null) as any,
        checkout_mode:   (page?.checkout_mode ?? 'cart') as 'single' | 'cart',
        seo_title:       page?.seo_title ?? '',
        seo_description: page?.seo_description ?? '',
        og_image:        page?.og_image ?? '',
        is_published:    page?.is_published ?? false,
        is_homepage:     page?.is_homepage ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) put(`/pages/${page!.id}`, { preserveScroll: true });
        else post('/pages');
    };

    return (
        <SubscriberLayout
            pageTitle={isEdit ? 'Edit Page' : 'New Page'}
            breadcrumb={[
                { label: 'Home', href: '/dashboard' },
                { label: 'Pages', href: '/pages' },
                { label: isEdit ? 'Edit' : 'New' },
            ]}
        >
            <Head title={isEdit ? `Edit: ${page?.title}` : 'New Page'} />

            <form onSubmit={submit}>
                <div className="row g-3">
                    <div className="col-lg-9">
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body">
                                <label className="form-label fw-medium">Page Title *</label>
                                <input
                                    type="text"
                                    className={`form-control form-control-lg ${errors.title ? 'is-invalid' : ''}`}
                                    placeholder="e.g. Black Friday Sale"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                {isEdit && page && <small className="text-muted">URL slug: <code>{page.slug}</code></small>}
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom-0">
                                <ul className="nav nav-tabs card-header-tabs">
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === 'editor' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('editor')}
                                        >
                                            <i className="bi bi-pencil-square me-1"></i>Editor
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === 'seo' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('seo')}
                                        >
                                            <i className="bi bi-search me-1"></i>SEO
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('settings')}
                                        >
                                            <i className="bi bi-gear me-1"></i>Settings
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                {activeTab === 'editor' && (
                                    <div>
                                        <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <div className="btn-group" role="group">
                                                <button
                                                    type="button"
                                                    className={`btn ${data.editor_mode === 'tinymce' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setData('editor_mode', 'tinymce')}
                                                >
                                                    <i className="bi bi-pencil-square me-1"></i>TinyMCE (Basic)
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn ${data.editor_mode === 'grapesjs' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => features.can_use_drag_drop && setData('editor_mode', 'grapesjs')}
                                                    disabled={!features.can_use_drag_drop}
                                                    title={!features.can_use_drag_drop ? 'Upgrade to use drag & drop' : ''}
                                                >
                                                    <i className="bi bi-grid-1x2 me-1"></i>Drag &amp; Drop
                                                    {!features.can_use_drag_drop && <i className="bi bi-lock-fill ms-1"></i>}
                                                </button>
                                            </div>
                                        </div>

                                        {data.editor_mode === 'tinymce' ? (
                                            <TinyMCEEditor
                                                value={data.content_html}
                                                onChange={(val) => setData('content_html', val)}
                                                height={500}
                                            />
                                        ) : (
                                            <GrapesJSEditor
                                                initialHtml={data.content_html}
                                                initialData={data.grapesjs_data}
                                                onSave={(html, projectData) => {
                                                    setData('content_html', html);
                                                    setData('grapesjs_data', projectData as Record<string, unknown>);
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {activeTab === 'seo' && (
                                    <div>
                                        <div className="mb-3">
                                            <label className="form-label">SEO Title</label>
                                            <input type="text" className="form-control" value={data.seo_title} onChange={e => setData('seo_title', e.target.value)} maxLength={200} />
                                            <small className="text-muted">Defaults to page title if empty.</small>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Meta Description</label>
                                            <textarea className="form-control" rows={3} value={data.seo_description ?? ''} onChange={e => setData('seo_description', e.target.value)} maxLength={500}></textarea>
                                            <small className="text-muted">{(data.seo_description ?? '').length} / 500</small>
                                        </div>
                                        <div className="mb-0">
                                            <label className="form-label">OG Image URL</label>
                                            <input type="url" className="form-control" value={data.og_image ?? ''} onChange={e => setData('og_image', e.target.value)} placeholder="https://..." />
                                            <small className="text-muted">Image for social media share preview.</small>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div>
                                        <div className="mb-3">
                                            <label className="form-label fw-medium">Checkout Mode</label>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <div className={`card border-2 ${data.checkout_mode === 'single' ? 'border-primary bg-primary bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setData('checkout_mode', 'single')}>
                                                        <div className="card-body">
                                                            <i className="bi bi-bag fs-3 text-primary"></i>
                                                            <h6 className="fw-bold mt-2">Single Product</h6>
                                                            <small className="text-muted">One product per page, instant buy</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className={`card border-2 ${data.checkout_mode === 'cart' ? 'border-primary bg-primary bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setData('checkout_mode', 'cart')}>
                                                        <div className="card-body">
                                                            <i className="bi bi-cart fs-3 text-primary"></i>
                                                            <h6 className="fw-bold mt-2">Cart Mode</h6>
                                                            <small className="text-muted">Multiple products with cart</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm sticky-top" style={{ top: 80 }}>
                            <div className="card-header"><h6 className="card-title mb-0"><i className="bi bi-broadcast text-primary me-2"></i>Publish</h6></div>
                            <div className="card-body">
                                <div className="form-check form-switch mb-3">
                                    <input type="checkbox" className="form-check-input" id="is_published" checked={data.is_published} onChange={e => setData('is_published', e.target.checked)} />
                                    <label className="form-check-label fw-medium" htmlFor="is_published">
                                        {data.is_published ? (
                                            <><i className="bi bi-check-circle-fill text-success me-1"></i>Live</>
                                        ) : (
                                            <><i className="bi bi-eye-slash text-secondary me-1"></i>Draft</>
                                        )}
                                    </label>
                                </div>
                                <div className="form-check form-switch mb-0">
                                    <input type="checkbox" className="form-check-input" id="is_homepage" checked={data.is_homepage} onChange={e => setData('is_homepage', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="is_homepage">
                                        <i className="bi bi-house me-1"></i>Set as homepage
                                    </label>
                                </div>
                            </div>
                            <div className="card-footer bg-white">
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        <i className="bi bi-check-circle me-1"></i>
                                        {processing ? 'Saving...' : (isEdit ? 'Update Page' : 'Create Page')}
                                    </button>
                                    <Link href="/pages" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-1"></i>Back
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
