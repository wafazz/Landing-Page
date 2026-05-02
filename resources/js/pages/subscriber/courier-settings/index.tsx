import { Head, useForm, router } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';

interface CourierInfo {
    courier: string;
    is_sandbox: boolean;
    is_default: boolean;
    is_configured: boolean;
    preview: Record<string, string | null>;
}

interface Props {
    ninjavan: CourierInfo | null;
    jnt: CourierInfo | null;
    default_courier: string | null;
    can_print_awb: boolean;
}

export default function CourierSettingsIndex({ ninjavan, jnt, default_courier, can_print_awb }: Props) {
    const ninjaForm = useForm({
        courier: 'ninjavan',
        client_id: '',
        client_secret: '',
        pickup_phone: '',
        pickup_address: '',
        pickup_city: '',
        pickup_postcode: '',
        pickup_state: '',
        is_sandbox: ninjavan?.is_sandbox ?? true,
    });

    const jntForm = useForm({
        courier: 'jnt',
        api_account: '',
        private_key: '',
        customer_code: '',
        pickup_phone: '',
        pickup_address: '',
        pickup_city: '',
        pickup_postcode: '',
        pickup_state: '',
        is_sandbox: jnt?.is_sandbox ?? true,
    });

    const submitNinja = (e: React.FormEvent) => { e.preventDefault(); ninjaForm.post('/courier-settings'); };
    const submitJnt = (e: React.FormEvent) => { e.preventDefault(); jntForm.post('/courier-settings'); };

    const setDefault = (courier: string) => {
        router.post('/courier-settings/default', { courier }, { preserveScroll: true });
    };

    return (
        <SubscriberLayout
            pageTitle="Courier Integration"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Courier Integration' }]}
        >
            <Head title="Courier Integration" />

            <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Connect your courier account to auto-create shipments + generate AWB on every paid order.
                {!can_print_awb && <span className="d-block small mt-1"><i className="bi bi-exclamation-triangle me-1"></i>AWB printing is not in your current package.</span>}
            </div>

            <div className="row g-3">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-truck text-danger me-2"></i>NinjaVan
                                {ninjavan?.is_default && <span className="badge text-bg-success ms-2"><i className="bi bi-star-fill me-1"></i>Default</span>}
                            </h5>
                            {ninjavan?.is_configured && !ninjavan?.is_default && (
                                <button onClick={() => setDefault('ninjavan')} className="btn btn-sm btn-outline-success">
                                    <i className="bi bi-star me-1"></i>Set Default
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {ninjavan?.is_configured && (
                                <div className="mb-3 p-3 bg-light rounded small">
                                    <div>Client ID: <code>{ninjavan.preview.client_id}</code></div>
                                    <div>Mode: <span className={`badge ${ninjavan.is_sandbox ? 'text-bg-warning' : 'text-bg-success'}`}>{ninjavan.is_sandbox ? 'Sandbox' : 'Production'}</span></div>
                                </div>
                            )}
                            <form onSubmit={submitNinja}>
                                <div className="mb-3">
                                    <label className="form-label">Client ID</label>
                                    <input type="text" className="form-control" value={ninjaForm.data.client_id} onChange={e => ninjaForm.setData('client_id', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Client Secret</label>
                                    <input type="password" className="form-control" value={ninjaForm.data.client_secret} onChange={e => ninjaForm.setData('client_secret', e.target.value)} />
                                </div>
                                <hr />
                                <h6 className="fw-bold text-muted mb-3">Pickup Address</h6>
                                <div className="row g-2">
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="Phone" value={ninjaForm.data.pickup_phone} onChange={e => ninjaForm.setData('pickup_phone', e.target.value)} /></div>
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="Postcode" value={ninjaForm.data.pickup_postcode} onChange={e => ninjaForm.setData('pickup_postcode', e.target.value)} /></div>
                                    <div className="col-12"><input type="text" className="form-control form-control-sm" placeholder="Street address" value={ninjaForm.data.pickup_address} onChange={e => ninjaForm.setData('pickup_address', e.target.value)} /></div>
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="City" value={ninjaForm.data.pickup_city} onChange={e => ninjaForm.setData('pickup_city', e.target.value)} /></div>
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="State" value={ninjaForm.data.pickup_state} onChange={e => ninjaForm.setData('pickup_state', e.target.value)} /></div>
                                </div>
                                <div className="form-check form-switch mt-3 mb-3">
                                    <input type="checkbox" className="form-check-input" id="ninja_sandbox" checked={ninjaForm.data.is_sandbox} onChange={e => ninjaForm.setData('is_sandbox', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="ninja_sandbox">Sandbox Mode</label>
                                </div>
                                <button type="submit" className="btn btn-danger w-100" disabled={ninjaForm.processing}>
                                    <i className="bi bi-check-circle me-1"></i>Save NinjaVan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-truck text-warning me-2"></i>J&T Express
                                {jnt?.is_default && <span className="badge text-bg-success ms-2"><i className="bi bi-star-fill me-1"></i>Default</span>}
                            </h5>
                            {jnt?.is_configured && !jnt?.is_default && (
                                <button onClick={() => setDefault('jnt')} className="btn btn-sm btn-outline-success">
                                    <i className="bi bi-star me-1"></i>Set Default
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {jnt?.is_configured && (
                                <div className="mb-3 p-3 bg-light rounded small">
                                    <div>API Account: <code>{jnt.preview.api_account}</code></div>
                                    <div>Customer Code: <code>{jnt.preview.customer_code}</code></div>
                                    <div>Mode: <span className={`badge ${jnt.is_sandbox ? 'text-bg-warning' : 'text-bg-success'}`}>{jnt.is_sandbox ? 'Sandbox' : 'Production'}</span></div>
                                </div>
                            )}
                            <form onSubmit={submitJnt}>
                                <div className="mb-3">
                                    <label className="form-label">API Account</label>
                                    <input type="text" className="form-control" value={jntForm.data.api_account} onChange={e => jntForm.setData('api_account', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Private Key</label>
                                    <input type="password" className="form-control" value={jntForm.data.private_key} onChange={e => jntForm.setData('private_key', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Customer Code</label>
                                    <input type="text" className="form-control" value={jntForm.data.customer_code} onChange={e => jntForm.setData('customer_code', e.target.value)} />
                                </div>
                                <hr />
                                <h6 className="fw-bold text-muted mb-3">Pickup Address</h6>
                                <div className="row g-2">
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="Phone" value={jntForm.data.pickup_phone} onChange={e => jntForm.setData('pickup_phone', e.target.value)} /></div>
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="Postcode" value={jntForm.data.pickup_postcode} onChange={e => jntForm.setData('pickup_postcode', e.target.value)} /></div>
                                    <div className="col-12"><input type="text" className="form-control form-control-sm" placeholder="Street address" value={jntForm.data.pickup_address} onChange={e => jntForm.setData('pickup_address', e.target.value)} /></div>
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="City" value={jntForm.data.pickup_city} onChange={e => jntForm.setData('pickup_city', e.target.value)} /></div>
                                    <div className="col-md-6"><input type="text" className="form-control form-control-sm" placeholder="State" value={jntForm.data.pickup_state} onChange={e => jntForm.setData('pickup_state', e.target.value)} /></div>
                                </div>
                                <div className="form-check form-switch mt-3 mb-3">
                                    <input type="checkbox" className="form-check-input" id="jnt_sandbox" checked={jntForm.data.is_sandbox} onChange={e => jntForm.setData('is_sandbox', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="jnt_sandbox">Sandbox Mode</label>
                                </div>
                                <button type="submit" className="btn btn-warning w-100" disabled={jntForm.processing}>
                                    <i className="bi bi-check-circle me-1"></i>Save J&T
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {default_courier && (
                <div className="alert alert-success mt-3 mb-0">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Default courier: <strong className="text-uppercase">{default_courier}</strong>. Shipments will be auto-created on paid orders.
                </div>
            )}
        </SubscriberLayout>
    );
}
