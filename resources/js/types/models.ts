export type UserRole = 'admin' | 'subscriber';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    subscriber_slug: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

export interface SubscriptionStatus {
    id: number;
    status: 'pending' | 'trial' | 'active' | 'expired' | 'cancelled';
    package_name: string | null;
    package_slug: string | null;
    is_trial: boolean;
    is_active: boolean;
    in_grace: boolean;
    days_left: number;
    ends_at: string | null;
    trial_ends_at: string | null;
    features: {
        max_landing_pages: number | null;
        max_products: number | null;
        can_use_drag_drop: boolean;
        can_connect_courier: boolean;
        can_print_awb: boolean;
        can_use_custom_domain: boolean;
    };
}

export interface Package {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    billing_cycle: 'monthly' | 'yearly';
    tag: 'normal' | 'promo' | 'trial';
    max_landing_pages: number;
    max_products: number | null;
    can_use_tinymce: boolean;
    can_use_drag_drop: boolean;
    can_connect_courier: boolean;
    can_print_awb: boolean;
    can_use_custom_domain: boolean;
    is_active: boolean;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    subscription: SubscriptionStatus | null;
    flash: FlashMessage;
    siteLogo: string | null;
    siteName: string;
    [key: string]: unknown;
}
