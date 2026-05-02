import { Head, useForm, router } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';

interface GatewayInfo {
    gateway: string;
    is_sandbox: boolean;
    is_default: boolean;
    is_configured: boolean;
    preview: Record<string, string | null>;
}

interface Props {
    billplz: GatewayInfo | null;
    senangpay: GatewayInfo | null;
    default_gateway: string | null;
}

export default function PaymentSettingsIndex({ billplz, senangpay, default_gateway }: Props) {
    const billplzForm = useForm({
        gateway: 'billplz',
        api_key: '',
        collection_id: '',
        x_signature: '',
        is_sandbox: billplz?.is_sandbox ?? true,
    });

    const senangpayForm = useForm({
        gateway: 'senangpay',
        merchant_id: '',
        secret_key: '',
        is_sandbox: senangpay?.is_sandbox ?? true,
    });

    const submitBillplz = (e: React.FormEvent) => { e.preventDefault(); billplzForm.post('/payment-settings'); };
    const submitSenangPay = (e: React.FormEvent) => { e.preventDefault(); senangpayForm.post('/payment-settings'); };

    const setDefault = (gateway: string) => {
        router.post('/payment-settings/default', { gateway }, { preserveScroll: true });
    };

    return (
        <SubscriberLayout
            pageTitle="Payment Gateway"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Payment Gateway' }]}
        >
            <Head title="Payment Gateway" />

            <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Configure your own payment gateway to receive customer payments directly into your account.
            </div>

            <div className="row g-3">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-credit-card-fill text-primary me-2"></i>Billplz
                                {billplz?.is_default && <span className="badge text-bg-success ms-2"><i className="bi bi-star-fill me-1"></i>Default</span>}
                            </h5>
                            {billplz?.is_configured && !billplz?.is_default && (
                                <button onClick={() => setDefault('billplz')} className="btn btn-sm btn-outline-success">
                                    <i className="bi bi-star me-1"></i>Set Default
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {billplz?.is_configured && (
                                <div className="mb-3 p-3 bg-light rounded">
                                    <small className="text-secondary text-uppercase fw-semibold">Currently Configured</small>
                                    <div className="small mt-1">
                                        <div>API Key: <code>{billplz.preview.api_key}</code></div>
                                        <div>Collection: <code>{billplz.preview.collection_id}</code></div>
                                        <div>Mode: <span className={`badge ${billplz.is_sandbox ? 'text-bg-warning' : 'text-bg-success'}`}>{billplz.is_sandbox ? 'Sandbox' : 'Production'}</span></div>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={submitBillplz}>
                                <div className="mb-3">
                                    <label className="form-label">API Key {billplz?.is_configured && <small className="text-muted">(leave blank to keep current)</small>}</label>
                                    <input type="password" className="form-control" value={billplzForm.data.api_key} onChange={e => billplzForm.setData('api_key', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Collection ID</label>
                                    <input type="text" className="form-control" value={billplzForm.data.collection_id} onChange={e => billplzForm.setData('collection_id', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">X Signature <small className="text-muted">(optional)</small></label>
                                    <input type="password" className="form-control" value={billplzForm.data.x_signature} onChange={e => billplzForm.setData('x_signature', e.target.value)} />
                                </div>
                                <div className="form-check form-switch mb-3">
                                    <input type="checkbox" className="form-check-input" id="billplz_sandbox" checked={billplzForm.data.is_sandbox} onChange={e => billplzForm.setData('is_sandbox', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="billplz_sandbox">Sandbox Mode</label>
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={billplzForm.processing}>
                                    <i className="bi bi-check-circle me-1"></i>Save Billplz
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-wallet2 text-success me-2"></i>SenangPay
                                {senangpay?.is_default && <span className="badge text-bg-success ms-2"><i className="bi bi-star-fill me-1"></i>Default</span>}
                            </h5>
                            {senangpay?.is_configured && !senangpay?.is_default && (
                                <button onClick={() => setDefault('senangpay')} className="btn btn-sm btn-outline-success">
                                    <i className="bi bi-star me-1"></i>Set Default
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {senangpay?.is_configured && (
                                <div className="mb-3 p-3 bg-light rounded">
                                    <small className="text-secondary text-uppercase fw-semibold">Currently Configured</small>
                                    <div className="small mt-1">
                                        <div>Merchant ID: <code>{senangpay.preview.merchant_id}</code></div>
                                        <div>Secret Key: <code>{senangpay.preview.secret_key}</code></div>
                                        <div>Mode: <span className={`badge ${senangpay.is_sandbox ? 'text-bg-warning' : 'text-bg-success'}`}>{senangpay.is_sandbox ? 'Sandbox' : 'Production'}</span></div>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={submitSenangPay}>
                                <div className="mb-3">
                                    <label className="form-label">Merchant ID</label>
                                    <input type="text" className="form-control" value={senangpayForm.data.merchant_id} onChange={e => senangpayForm.setData('merchant_id', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Secret Key</label>
                                    <input type="password" className="form-control" value={senangpayForm.data.secret_key} onChange={e => senangpayForm.setData('secret_key', e.target.value)} />
                                </div>
                                <div className="form-check form-switch mb-3">
                                    <input type="checkbox" className="form-check-input" id="senangpay_sandbox" checked={senangpayForm.data.is_sandbox} onChange={e => senangpayForm.setData('is_sandbox', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="senangpay_sandbox">Sandbox Mode</label>
                                </div>
                                <button type="submit" className="btn btn-success w-100" disabled={senangpayForm.processing}>
                                    <i className="bi bi-check-circle me-1"></i>Save SenangPay
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {default_gateway && (
                <div className="alert alert-success mt-3 mb-0">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Default gateway: <strong>{default_gateway}</strong>. Customers will be charged using this gateway.
                </div>
            )}
        </SubscriberLayout>
    );
}
