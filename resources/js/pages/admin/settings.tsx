import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import type { PageProps } from '@/types/models';

interface SettingsBag {
    site_name: string | null;
    trial_days: string | null;
    grace_period_days: string | null;
    site_logo: string | null;
    billplz_api_key: string | null;
    billplz_collection_id: string | null;
    billplz_x_signature: string | null;
    billplz_sandbox: string | null;
    brevo_api_key: string | null;
    onsend_api_key: string | null;
    onsend_instance_id: string | null;
}

interface Props {
    settings: SettingsBag;
}

export default function AdminSettings({ settings }: Props) {
    const { props } = usePage<PageProps>();
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        site_name:             settings.site_name ?? '',
        trial_days:            settings.trial_days ?? '15',
        grace_period_days:     settings.grace_period_days ?? '3',
        billplz_api_key:       settings.billplz_api_key ?? '',
        billplz_collection_id: settings.billplz_collection_id ?? '',
        billplz_x_signature:   settings.billplz_x_signature ?? '',
        billplz_sandbox:       settings.billplz_sandbox === '1',
        brevo_api_key:         settings.brevo_api_key ?? '',
        onsend_api_key:        settings.onsend_api_key ?? '',
        onsend_instance_id:    settings.onsend_instance_id ?? '',
        logo:                  null as File | null,
        _method:               'POST' as string,
    });

    const submit = () => {
        post('/admin/settings', { forceFormData: true, preserveScroll: true });
    };

    return (
        <AdminLayout
            pageTitle="Platform Settings"
            breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Settings' }]}
        >
            <Head title="Platform Settings" />

            <div className="row g-3">
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-image text-primary me-2"></i>Branding</h5></div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Site Name</label>
                                <input type="text" className="form-control" value={data.site_name} onChange={e => setData('site_name', e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Site Logo</label>
                                {props.siteLogo && (
                                    <div className="mb-2">
                                        <img src={props.siteLogo} alt="Logo" style={{ maxHeight: 60 }} />
                                    </div>
                                )}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={e => setData('logo', e.target.files?.[0] ?? null)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-clock-history text-info me-2"></i>Trial & Billing</h5></div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Trial Days</label>
                                <input type="number" min="0" className={`form-control ${errors.trial_days ? 'is-invalid' : ''}`} value={data.trial_days} onChange={e => setData('trial_days', e.target.value)} />
                                {errors.trial_days && <div className="invalid-feedback">{errors.trial_days}</div>}
                            </div>
                            <div className="mb-0">
                                <label className="form-label">Grace Period (Days)</label>
                                <input type="number" min="0" className="form-control" value={data.grace_period_days} onChange={e => setData('grace_period_days', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-credit-card text-success me-2"></i>Billplz (SaaS Billing)</h5></div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">API Key</label>
                                    <input type="password" className="form-control" value={data.billplz_api_key} onChange={e => setData('billplz_api_key', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Collection ID</label>
                                    <input type="text" className="form-control" value={data.billplz_collection_id} onChange={e => setData('billplz_collection_id', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">X Signature</label>
                                    <input type="password" className="form-control" value={data.billplz_x_signature} onChange={e => setData('billplz_x_signature', e.target.value)} />
                                </div>
                                <div className="col-md-6 d-flex align-items-end">
                                    <div className="form-check form-switch">
                                        <input type="checkbox" className="form-check-input" id="billplz_sandbox" checked={data.billplz_sandbox} onChange={e => setData('billplz_sandbox', e.target.checked)} />
                                        <label className="form-check-label" htmlFor="billplz_sandbox">Sandbox Mode</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-envelope text-warning me-2"></i>Brevo (Email)</h5></div>
                        <div className="card-body">
                            <label className="form-label">API Key</label>
                            <input type="password" className="form-control" value={data.brevo_api_key} onChange={e => setData('brevo_api_key', e.target.value)} />
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-header"><h5 className="card-title mb-0"><i className="bi bi-whatsapp text-success me-2"></i>Onsend (WhatsApp)</h5></div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">API Key</label>
                                    <input type="password" className="form-control" value={data.onsend_api_key} onChange={e => setData('onsend_api_key', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Instance ID</label>
                                    <input type="text" className="form-control" value={data.onsend_instance_id} onChange={e => setData('onsend_instance_id', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-end mt-3">
                <button type="button" onClick={submit} className="btn btn-primary btn-lg" disabled={processing}>
                    <i className="bi bi-check-circle me-1"></i>{processing ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </AdminLayout>
    );
}
