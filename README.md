# LPage.my

A multi-tenant SaaS landing-page builder with full e-commerce checkout. Subscribers register, build pages with TinyMCE or GrapesJS, attach products, plug in their own payment gateway and courier, and ship orders end-to-end — all under their own subdomain or custom domain.

**Status:** all 10 planned phases complete · feature-done · ready for deployment.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Laravel 12, PHP 8.3+ |
| Frontend | Inertia.js + React 19 + TypeScript |
| UI | AdminLTE 4 + Bootstrap 5.3 + react-bootstrap + bootstrap-icons |
| Charts | ApexCharts (`react-apexcharts`) |
| Editors | TinyMCE 8 (basic) · GrapesJS 0.22 (drag & drop) |
| PDF | DomPDF (`barryvdh/laravel-dompdf`) — AWB labels |
| Queue | Database driver |
| Database | MySQL 8 (local: port 3307, db `l_page`) |
| Build | Vite 8 |

---

## Features

### For subscribers
- **Two editor modes** — TinyMCE for everyone, GrapesJS drag & drop on Pro+ packages
- **Per-page checkout mode** — single-product or multi-product cart
- **Own payment gateway** — Billplz or SenangPay (encrypted credentials per user)
- **Own courier** — NinjaVan or J&T, auto-create shipment + AWB PDF on payment received
- **Subdomain** (`{slug}.lpage.my`) and **custom domain** support (Let's Encrypt)
- **Notification preferences** — toggle email/WhatsApp per event (order placed, payment received, shipment created, subscription expiring)
- **Analytics dashboard** — KPIs, 30-day revenue trend, top products, conversion rate
- **Per-page analytics** — views/unique visitors/orders/revenue with 7/30/90-day windows + referrer breakdown
- **Order CSV export** — UTF-8 BOM, filter-aware

### For platform admin
- **Package management** — feature-flag matrix per tier
- **Subscriber management** — view subscriptions, payments
- **Settings** — Brevo (email), Onsend (WhatsApp), Billplz (SaaS billing) credentials
- **Trial period** — 15-day default (configurable), 3-day grace period after expiry

### Notifications (queued)
- `order.placed`, `payment.received`, `shipment.created` → customer (email + WhatsApp)
- `subscription.expiring` → subscriber (email)
- 4 branded Blade email templates with shared layout
- 3 retries × 30s backoff via `SendNotificationJob`

---

## Roles

| Role | Access |
|---|---|
| `admin` | Platform owner — manages packages, subscribers, integrations |
| `subscriber` | Paying users who build landing pages and sell products |
| (guest) | End customers buying products via public checkout |

---

## Domain Strategy

- **Wildcard subdomain**: `*.lpage.my` (single Let's Encrypt DNS-01 cert)
- **Custom domains**: subscriber adds CNAME → `lpage.my`, Let's Encrypt HTTP-01 issues per-domain
- **Local dev fallback**: `/u/{subscriberSlug}/{pageSlug?}` route (no subdomain needed)

---

## Local Setup

**Prereqs:** PHP 8.3+, Composer, Node 20+, MySQL 8 running on port `3307` with empty database `l_page` (or edit `.env`).

```bash
git clone <repo> LPage && cd LPage
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate --seed
npm run build
```

Run the dev stack (server + queue + logs + vite, all in one):

```bash
composer dev
```

…or the components individually:

```bash
php artisan serve                               # http://127.0.0.1:8000
php artisan queue:listen --tries=1 --timeout=0  # process notifications
npm run dev                                     # vite HMR
php artisan schedule:work                       # cron (subscription expiry, notify-expiring)
```

### Seeded test accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@lpage.my` | `admin123` | Brevo + Onsend keys pre-seeded with placeholders |
| Subscriber (Pro) | `test@lpage.my` | `test1234` | Slug `testshop`, all-on notification prefs |

---

## Project Structure

```
app/
├── Console/Commands/
│   ├── SubscriptionCheckExpiry.php
│   └── SubscriptionNotifyExpiring.php
├── Http/Controllers/
│   ├── Admin/                 # platform admin
│   ├── Auth/                  # login, register, slug check
│   ├── Public/                # public landing pages, checkout, webhooks
│   └── Subscriber/            # subscriber dashboard, pages, products,
│                              #   orders, analytics, payment/courier/notif settings
├── Jobs/SendNotificationJob.php
├── Models/                    # User, Package, Subscription, LandingPage,
│                              #   Product, Order, Shipment, PageView, ...
└── Services/
    ├── Couriers/              # CourierContract + NinjaVan + J&T drivers
    ├── Notifications/         # NotificationService + Brevo + Onsend
    └── Payments/              # gateway helpers
resources/
├── js/
│   ├── pages/                 # Inertia React pages (admin, subscriber, auth, public)
│   ├── layouts/               # admin-layout, subscriber-layout, auth-layout
│   └── components/            # SmallBox, QuickAction, TrialBanner, toast, ...
└── views/emails/              # Blade email templates (nested, e.g. emails/order/placed.blade.php)
routes/
├── web.php                    # all HTTP routes
└── console.php                # scheduled commands
database/
├── migrations/                # 17 migrations
└── seeders/                   # PackageSeeder, SettingSeeder
```

---

## Key Routes

### Public
| Method | URI | Purpose |
|---|---|---|
| GET | `/` | Marketing page or resolved tenant landing page |
| GET | `/p/{slug}` | Landing page (subdomain/custom domain) |
| GET | `/u/{subscriberSlug}/{slug?}` | Local-dev landing page fallback |
| GET\|POST | `/checkout/{userSlug}/{pageSlug}` | Guest checkout |
| POST | `/webhooks/billplz/{userId}` | Billplz payment webhook (CSRF-exempt) |
| POST | `/webhooks/senangpay/{userId}` | SenangPay payment webhook (CSRF-exempt) |

### Subscriber (auth + role:subscriber + subscription)
| Method | URI | Purpose |
|---|---|---|
| GET | `/dashboard` | KPIs + charts (real data) |
| GET | `/analytics` | Per-page analytics + referrers |
| GET | `/pages` … `/pages/{page}/edit` | Landing page CRUD |
| GET | `/products` … | Product CRUD |
| GET | `/orders`, `/orders/{order}` | Orders list + detail |
| GET | `/orders/export` | Stream filtered orders CSV |
| GET\|POST | `/payment-settings` | Billplz / SenangPay credentials |
| GET\|POST | `/courier-settings` | NinjaVan / J&T credentials |
| GET\|POST | `/notification-prefs` | Per-event email/WhatsApp toggles |
| GET\|POST | `/domains` | Custom domain manager |
| POST | `/orders/{order}/shipment` | Create shipment + AWB |
| GET | `/orders/{order}/awb` | AWB PDF download |

### Admin (auth + role:admin)
| URI | Purpose |
|---|---|
| `/admin/dashboard` | Platform KPIs |
| `/admin/subscribers` | Subscriber list + detail |
| `/admin/packages` | Package CRUD + feature-flag matrix |
| `/admin/settings` | Brevo / Onsend / Billplz credentials |

---

## Scheduled Commands

```php
Schedule::command('subscription:check-expiry')->dailyAt('01:00');
Schedule::command('subscription:notify-expiring --days=3')->dailyAt('09:00');
```

Run locally with `php artisan schedule:work`.

---

## Architecture Notes

- **Encrypted credentials** — `user_payment_settings` and `user_courier_settings` use a `text` column with `AsEncryptedArrayObject` cast (NOT `json` — encrypted blobs aren't valid JSON and fail MySQL CHECK)
- **CSRF-exempt webhooks** — declared in `bootstrap/app.php` via `preventRequestForgery(except: ['webhooks/*'])` (Laravel 12; `validateCsrfTokens` is deprecated)
- **Email templates with dotted event names** — Blade resolves `emails.order.placed` to `emails/order/placed.blade.php` (nested folders, NOT a single file with dots)
- **Visitor analytics** — `lpage_vid` UUID cookie (1y) + `page_views` fact table; unique visitors via `COUNT(DISTINCT visitor_id)`
- **Data isolation** — every subscriber query is scoped by `user_id`
- **Notification dispatch** — `NotificationService` filters channels by (user prefs ∧ admin-configured keys); silently skips email if Brevo key missing, etc.
- **Phone normalization** — Onsend WhatsApp strips non-digits, prefixes `60` if missing (Malaysia)
- **AWB caching** — `storage/app/awb/{user_id}/awb-{awb_number}.pdf`, recorded on `shipment.label_path`

---

## Environment

```env
APP_URL=http://lpage.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=l_page
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database
SESSION_DRIVER=database
CACHE_STORE=database

# Set in admin panel, not .env:
# Brevo, Onsend, Billplz (SaaS billing)
```

---

## Phased Roadmap

1. [✔] Foundation — scaffold, auth, roles, layouts
2. [✔] SaaS Core — packages, subscriptions, Billplz, trial
3. [✔] Admin Panel — dashboard, CRUD, settings
4. [✔] Landing Page Builder — TinyMCE basic
5. [✔] Landing Page Builder — GrapesJS advanced
6. [✔] Subdomain + Custom Domain — Let's Encrypt
7. [✔] Products + Orders + Payment Settings — data layer
8A. [✔] Public Checkout + Gateway Webhooks — Billplz + SenangPay
8B. [✔] Courier Integration — NinjaVan + J&T + AWB PDF
9. [✔] Notifications — Brevo email + Onsend WhatsApp + 4 events queued
10. [✔] Polish & Analytics — visitor tracking, dashboard charts, CSV export

See `Planning.md` for the full spec, schemas, and ASCII flows.

---

## Deployment (target)

- VPS (DigitalOcean SG / Hetzner) + Laravel Forge
- Cloudflare in front (DNS + CDN)
- Wildcard SSL: Let's Encrypt DNS-01
- Custom domain SSL: Let's Encrypt HTTP-01 per domain
- MySQL 8, Nginx, PHP 8.3+, Redis + Horizon (when queue throughput climbs)

---

## License

Proprietary — internal product.
