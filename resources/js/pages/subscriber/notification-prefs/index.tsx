import { Head, router } from '@inertiajs/react';
import SubscriberLayout from '@/layouts/subscriber-layout';

interface Pref {
    event: string;
    label: string;
    email_enabled: boolean;
    whatsapp_enabled: boolean;
}

interface Props { prefs: Pref[]; }

export default function NotificationPrefsIndex({ prefs }: Props) {
    const toggle = (event: string, channel: 'email_enabled' | 'whatsapp_enabled', current: boolean, other: boolean) => {
        const payload = {
            event,
            email_enabled: channel === 'email_enabled' ? !current : other,
            whatsapp_enabled: channel === 'whatsapp_enabled' ? !current : other,
        };
        router.post('/notification-prefs', payload, { preserveScroll: true });
    };

    return (
        <SubscriberLayout
            pageTitle="Notification Preferences"
            breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Notifications' }]}
        >
            <Head title="Notification Preferences" />

            <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Choose which notifications your customers receive. Emails go via Brevo, WhatsApp via Onsend.
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <table className="table mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Event</th>
                                <th className="text-center" style={{ width: 140 }}><i className="bi bi-envelope me-1"></i>Email</th>
                                <th className="text-center" style={{ width: 160 }}><i className="bi bi-whatsapp me-1"></i>WhatsApp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prefs.map(p => (
                                <tr key={p.event}>
                                    <td>
                                        <strong>{p.label}</strong>
                                        <div className="small text-muted"><code>{p.event}</code></div>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check form-switch d-inline-flex">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={p.email_enabled}
                                                onChange={() => toggle(p.event, 'email_enabled', p.email_enabled, p.whatsapp_enabled)}
                                            />
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check form-switch d-inline-flex">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={p.whatsapp_enabled}
                                                onChange={() => toggle(p.event, 'whatsapp_enabled', p.whatsapp_enabled, p.email_enabled)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="alert alert-warning mt-3 mb-0 small">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Notifications only fire when admin has configured Brevo / Onsend credentials.
            </div>
        </SubscriberLayout>
    );
}
