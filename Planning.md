





















# LPage.my — Planning Document

**Project**: LPage.my — SaaS Landing Page Builder
**Owner**: Fakrul
**Date**: 2026-05-01
**Status**: Planning Phase

---

## 1. Project Overview

LPage.my is a SaaS platform that lets subscribers build and publish landing pages with full e-commerce checkout. Two editor modes (TinyMCE basic / GrapesJS advanced) gated by subscription tier. Subscribers connect their own payment gateway (Billplz/SenangPay) and courier service (NinjaVan/J&T) for end-to-end order fulfillment.

**Two-sided platform**:
- **System Owner (Admin)** — manages packages, subscribers, platform integrations
- **Subscriber (Landlord of pages)** — builds landing pages, sells products, fulfills orders

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Backend | Laravel 12 |
| Frontend | Inertia.js + React 19 + TypeScript |
| UI Kit | **AdminLTE 4 + Bootstrap 5.3 + react-bootstrap + bootstrap-icons** |
| Dashboard layout | Left sidebar (AdminLTE), top navbar, content header w/ breadcrumbs, footer |
| Database | MySQL (XAMPP port 3307, db: `l_page`) |
| Drag & Drop | **GrapesJS** (web-builder focused, exports clean HTML/CSS) |
| Rich Text | **TinyMCE** (basic editor mode) |
| Charts | ApexCharts (react-apexcharts) |
| PDF | DomPDF (receipts, AWB) |
| Loading bar | NProgress |

---

## 3. User Roles

| Role | Description | Subscription? |
|---|---|---|
| `admin` | Platform owner | No |
| `subscriber` | Landing page creator (paying customer) | Yes (required) |

> No "tenant" role like PropSync — end customers buying products are NOT users, just guest checkout records.

---

## 4. Core Modules

### Admin Side
- Interactive dashboard (stats + charts)
- Package management (CRUD + feature flags)
- Subscriber listing + detail view
- Subscription sales statistics
- Platform settings:
  - Billplz (SaaS billing — subscriber pays admin)
  - Brevo (transactional email)
  - Onsend (WhatsApp notifications)
- Manual payment review (if applicable)

### Subscriber Side
- Interactive dashboard (page views, sales, orders)
- Landing page builder
  - Basic: TinyMCE
  - Advanced: GrapesJS drag & drop (gated by package)
- Product management (wired to landing pages)
- Order management (orders received from landing pages)
- Payment gateway settings (their own Billplz/SenangPay)
- Courier integration (NinjaVan/J&T) — gated
- AWB printing — gated
- Subdomain + custom domain settings

---

## 5. Subdomain & Custom Domain Strategy

### Domain Support Policy

| Domain Type | Example | Support | SSL Method |
|---|---|---|---|
| Wildcard subdomain (ours) | `*.lpage.my` | ✅ **Full** | Let's Encrypt DNS-01 (one wildcard cert) |
| Custom root domain | `johnshop.com` | ✅ **Full** | Let's Encrypt HTTP-01 per domain |
| Custom www | `www.johnshop.com` | ✅ **Full** | Let's Encrypt HTTP-01 per domain |
| Custom specific subdomain | `shop.johnshop.com` | ✅ **Full** | Let's Encrypt HTTP-01 per domain |
| Custom wildcard | `*.johnshop.com` | ❌ **Not supported** | (would require subscriber's DNS API access) |

> Matches industry standard (Webflow, Shopify, Carrd, Framer). Subscribers can add unlimited specific custom (sub)domains, but no wildcard custom domains in v1.

### Subdomain (default — included in all paid packages)
- Format: `{subscriber-slug}.lpage.my` → e.g. `johnshop.lpage.my`
- Wildcard DNS: `*.lpage.my` → server IP (one A record)
- Wildcard SSL: Let's Encrypt DNS-01 challenge (single cert for all subscriber subdomains)
- Laravel route: detect host → resolve subscriber → render page by slug

### Custom Domain (premium — package-gated)
- Subscriber adds CNAME: `their-domain.com` → `lpage.my`
- Domain verification (TXT record check OR CNAME lookup)
- SSL: **Let's Encrypt HTTP-01** per domain, auto-renewal cron
- Multiple custom domains per subscriber allowed (specific only, no wildcard)
- DB: `custom_domains` table linked to subscriber

### Page URL
- Subdomain: `johnshop.lpage.my/promo-product` (slug-based)
- Custom domain: `johnshop.com/promo-product`
- Homepage option: subscriber picks one page as `/` (root)

---

## 6. Package Feature Matrix

| Feature | Field | Type |
|---|---|---|
| Max landing pages | `max_landing_pages` | int |
| TinyMCE editor | `can_use_tinymce` | bool (default true) |
| Drag & drop editor | `can_use_drag_drop` | bool |
| Courier integration | `can_connect_courier` | bool |
| AWB printing | `can_print_awb` | bool |
| Custom domain | `can_use_custom_domain` | bool |
| Max products | `max_products` | int (nullable = unlimited) |

Example tiers:
- **Starter** — 3 pages, TinyMCE only
- **Pro** — 10 pages, drag & drop, courier
- **Business** — unlimited pages, custom domain, AWB

---

## 7. Database Schema (Preview)

### Core
- `users` (id, name, email, password, role, subscriber_slug [unique, registration-picked], …)
- `packages` (id, name, price, features JSON, max_landing_pages, can_use_drag_drop, can_connect_courier, can_print_awb, can_use_custom_domain, max_products, is_active, tag)
- `subscriptions` (id, user_id, package_id, status, starts_at, ends_at, …)
- `subscription_payments` (id, subscription_id, gateway, amount, status, …)

### Landing Pages
- `landing_pages` (id, user_id, title, slug, editor_mode [tinymce|grapesjs], content_html, grapesjs_data JSON, checkout_mode [single|cart], is_published, is_homepage, seo_title, seo_desc, og_image, views_count)
- `custom_domains` (id, user_id, domain, is_verified, verification_token, ssl_status [pending|active|failed], ssl_cert_path, ssl_expires_at)

### Products & Orders
- `products` (id, user_id, name, slug, price, stock, images JSON, description, is_active)
- `landing_page_products` (pivot: landing_page_id, product_id, sort_order)
- `orders` (id, user_id, landing_page_id, customer_name, email, phone, address, total, payment_status, gateway, gateway_ref)
- `order_items` (id, order_id, product_id, qty, price)
- `shipments` (id, order_id, courier, awb_number, tracking_url, status, label_path)

### Settings
- `settings` (key-value, cached) — admin platform creds
- `user_payment_settings` (user_id, gateway, credentials JSON)
- `user_courier_settings` (user_id, courier, credentials JSON)

---

## 8. API Integrations

| Service | Purpose | Side |
|---|---|---|
| Billplz | SaaS billing (subscriber pays admin) | Admin |
| Brevo | Transactional email | Admin |
| Onsend | WhatsApp notifications | Admin |
| Billplz | Customer checkout | Subscriber |
| SenangPay | Customer checkout (alt) | Subscriber |
| NinjaVan API | Shipping + AWB | Subscriber |
| J&T API | Shipping + AWB | Subscriber |

---

## 9. Phased Roadmap

### Phase 1 — Foundation [✔]
- [✔] Laravel 12 + Inertia + React + TS scaffold
- [✔] Auth (login, register, password reset)
- [✔] Role middleware (admin / subscriber)
- [✔] Layouts: `admin-layout`, `subscriber-layout`, `auth-layout`
- [✔] Material Tailwind setup _(later swapped to Bootstrap 5.3 + react-bootstrap per Fakrul)_
- [✔] Data isolation by `user_id`
- [✔] Error pages (403/404/500)

### Phase 2 — SaaS Core (reuse PropSync blueprint) [✔]
- [✔] Packages table + admin CRUD
- [✔] Subscriptions + status lifecycle (pending → active)
- [✔] Billplz integration for SaaS billing
- [✔] Trial system (admin-configurable days)
- [✔] Grace period (3 days)
- [✔] `EnsureSubscription` middleware
- [✔] Subscription expiry checker (scheduled)

### Phase 3 — Admin Panel [✔]
- [✔] Dashboard (subscriber count, MRR, recent signups, sales chart)
- [✔] Package CRUD with feature flag toggles
- [✔] Subscriber listing + detail
- [✔] Sales statistics
- [✔] Settings page: Billplz + Brevo + Onsend creds, trial days, site logo

### Phase 4 — Landing Page Builder (Basic — TinyMCE) [✔]
- [✔] Landing pages CRUD
- [✔] TinyMCE editor with image upload
- [✔] Slug auto-generation
- [✔] SEO fields (title, desc, OG image)
- [✔] Publish toggle
- [✔] Page limit enforcement (`max_landing_pages`)

### Phase 5 — Landing Page Builder (Advanced — GrapesJS) [✔]
- [✔] GrapesJS React integration
- [✔] Custom blocks: hero, product card, form, CTA, image, video, testimonial
- [✔] Save as JSON + rendered HTML
- [✔] Gated by `can_use_drag_drop`
- [✔] Mobile preview
- [✔] Asset manager (images upload)

### Phase 6 — Subdomain + Custom Domain [✔]
- [✔] Wildcard subdomain routing
- [✔] Subscriber slug system
- [✔] Custom domain CRUD + verification
- [✔] Domain resolver middleware
- [✔] SSL strategy (Cloudflare for SaaS recommended)
- [✔] Page rendering on subdomain/custom domain (public, no auth)

### Phase 7 — Products & Checkout [✔]
- [✔] Products CRUD (per subscriber)
- [✔] Attach products to landing pages
- [✔] Subscriber payment gateway settings (Billplz/SenangPay)
- [✔] Public checkout flow (guest)
- [✔] Orders table + admin view (subscriber's order list)
- [✔] Webhook handlers for each gateway

### Phase 8 — Courier Integration [✔]
- [✔] Courier settings per subscriber (NinjaVan/J&T credentials)
- [✔] API integration: create shipment, get AWB
- [✔] AWB PDF generation (DomPDF)
- [✔] Shipment tracking status sync
- [✔] Gated by `can_connect_courier` + `can_print_awb`

### Phase 9 — Notifications [✔]
- [✔] Brevo email service
- [✔] Onsend WhatsApp service
- [✔] Events: order placed, payment received, shipment created, subscription expiring
- [✔] Notification queue (database queue + SendNotificationJob)

### Phase 10 — Polish & Analytics [✔]
- [✔] Landing page visitor analytics (page_views table, visitor cookie, conversion rate)
- [✔] Subscriber dashboard charts (real revenue trend, orders week, top products)
- [✔] Per-page Analytics page (views/orders/revenue/conversion + referrers, 7/30/90-day windows)
- [✔] Order export (CSV, filterable, UTF-8 BOM for Excel)
- [✔] Final QA + bug sweep (all subscriber routes 200, deprecation warnings fixed)

---

## 10. Key Patterns (carry over from PropSync)
- `router.post` with `forceFormData: true` for file uploads
- `_method: PUT` for updates via POST
- `usePage().props as unknown as PageProps` for type casting
- All queries scoped by `user_id` (data isolation)
- Flash messages auto-dismiss (4s success, 5s error)
- MySQL timestamp columns nullable
- Material Tailwind gradient CardHeader: parent `mt-4 overflow-visible`, header `mb-8`
- Filter Selects: `grid grid-cols-N` (not flex with widths)
- Settings model: key-value with 60s cache
- `Inertia::location()` for external payment URL redirects

---

## 11. Locked Decisions

- [x] **SSL for custom domains** → **Let's Encrypt** (free, auto-renewal cron, HTTP-01 challenge per domain)
- [x] **GrapesJS storage** → **Both JSON + compiled HTML** (JSON for re-editing in builder, HTML for fast public serving — industry standard)
- [x] **Editor mode toggle** → **Package-gated**:
  - Trial / Starter package: locked to TinyMCE
  - Pro+ packages: subscriber picks per page (TinyMCE OR GrapesJS), can switch later
- [x] **Product checkout** → **Subscriber chooses per page**: single-product mode OR cart mode (multiple products) — flag on `landing_pages` table
- [x] **Subscriber slug** → **Picked at registration** with real-time availability check (unique, lowercase, alphanumeric + hyphens)
- [x] **Free trial** → **Yes**, with restricted feature set (see Trial Package below)

### Trial Package (hardcoded restrictions)

| Feature | Trial Limit |
|---|---|
| Duration | **15 days** (admin-configurable in Settings) |
| Subdomain | ✅ Yes |
| Custom domain | ❌ No |
| Max landing pages | **1** |
| Editor | TinyMCE only |
| Drag & drop | ❌ No |
| Courier API | ❌ No |
| AWB printing | ❌ No |
| Max products | TBD (suggest: 5) |

After trial expires → grace period → must subscribe to a paid package.

---

## 12. Folder Structure (planned)

```
~/Desktop/LPage/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   ├── Subscriber/
│   │   │   ├── Auth/
│   │   │   └── Public/        # subdomain page rendering
│   │   ├── Middleware/
│   │   │   ├── EnsureSubscription.php
│   │   │   ├── ResolveDomain.php
│   │   │   └── HandleInertiaRequests.php
│   ├── Models/
│   ├── Services/
│   │   ├── BillplzService.php
│   │   ├── BrevoService.php
│   │   ├── OnsendService.php
│   │   ├── SenangPayService.php
│   │   ├── NinjaVanService.php
│   │   ├── JNTService.php
│   │   └── SubscriptionService.php
│   └── Notifications/
├── resources/js/
│   ├── layouts/
│   │   ├── admin-layout/
│   │   ├── subscriber-layout/
│   │   └── auth-layout/
│   ├── pages/
│   │   ├── admin/
│   │   ├── subscriber/
│   │   ├── auth/
│   │   └── public/            # rendered landing pages
│   ├── components/
│   │   ├── editor/
│   │   │   ├── tinymce-editor.tsx
│   │   │   └── grapesjs-editor.tsx
│   │   └── builder-blocks/    # GrapesJS custom blocks
│   ├── widgets/layout/
│   ├── types/
│   └── context/
└── Planning.md
```

---

## 13. Deployment Architecture

### Hosting
- **Server**: VPS (DigitalOcean Singapore / Hetzner / Vultr) provisioned via **Laravel Forge**
- **OS**: Ubuntu 22.04 LTS
- **PHP**: 8.3+
- **Web server**: Nginx
- **DB**: MySQL 8 (production) / port 3307 XAMPP (local)
- **Queue**: Redis + Laravel Horizon
- **Scheduler**: Laravel Scheduler (cron `* * * * * php artisan schedule:run`)

### DNS / CDN (Optional but recommended)
- **Cloudflare** in front for DNS + DDoS + caching (free plan is enough)
- DNS records:
  - `lpage.my` → server IP
  - `*.lpage.my` → server IP (wildcard for subscriber subdomains)

### SSL Strategy

**Main app + wildcard subdomain** (`lpage.my` + `*.lpage.my`):
- Let's Encrypt with **DNS-01 challenge** (required for wildcard)
- Auto-renewal via certbot cron (every 60 days)
- Forge handles this if using Cloudflare DNS API

**Subscriber custom domains**:
- Subscriber adds CNAME: `their-domain.com` → `lpage.my`
- We verify CNAME is correct (DNS lookup)
- Trigger certbot **HTTP-01 challenge** for that domain
- Store cert path in `custom_domains` table
- Auto-renewal cron job runs daily, renews certs nearing expiry
- Failed renewals trigger admin notification + email subscriber

### Storage
- Local server storage initially (`storage/app/public/`)
- Cloudflare R2 or AWS S3 later if scaling needs it

### Deployment Flow
1. GitHub repo → push to `main`
2. Laravel Forge auto-deploys on push
3. `composer install --no-dev`, `npm ci && npm run build`, `php artisan migrate --force`, `php artisan optimize`

---

## 14. System Flow Diagrams

### 14.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           LPage.my SaaS                              │
└─────────────────────────────────────────────────────────────────────┘

   ┌──────────┐         ┌──────────────┐         ┌────────────────┐
   │  ADMIN   │         │  SUBSCRIBER  │         │   END CUSTOMER │
   │ (owner)  │         │  (paid user) │         │   (page visit) │
   └────┬─────┘         └──────┬───────┘         └────────┬───────┘
        │                      │                          │
        │ manages              │ builds & sells           │ buys product
        ▼                      ▼                          ▼
   ┌────────────────┐    ┌──────────────┐         ┌────────────────┐
   │ Admin Panel    │    │  Subscriber  │         │ Public Landing │
   │ /admin/*       │    │  Dashboard   │         │ Page (subdomain│
   │                │    │  /app/*      │         │ or custom dom) │
   └────────┬───────┘    └──────┬───────┘         └────────┬───────┘
            │                   │                          │
            └───────────────────┼──────────────────────────┘
                                ▼
                    ┌──────────────────────┐
                    │   Laravel Backend    │
                    │   (MySQL: l_page)    │
                    └──────────────────────┘
```

### 14.2 Domain Resolution Flow

```
   Visitor types URL
          │
          ▼
   ┌──────────────┐
   │  Cloudflare  │  ◄── DNS for lpage.my + *.lpage.my
   │  (DNS + CDN) │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────┐
   │  VPS (Laravel + Nginx)   │
   │  ResolveDomain Middleware│
   └──────┬───────────────────┘
          │
          ├── host = "lpage.my"           ──► Marketing site / Login
          │
          ├── host = "*.lpage.my"         ──► Lookup user by subscriber_slug
          │                                   └► Render landing_page
          │
          └── host = "johnshop.com"       ──► Lookup custom_domains table
                                              ├► verified? ─► Render page
                                              └► not verified? ─► 404
```

### 14.3 Subscriber → Page → Order Flow

```
  ┌────────────┐
  │ Subscriber │ login → dashboard
  └─────┬──────┘
        │
        ├──[1]──► Create Landing Page
        │         ├── pick editor (TinyMCE / GrapesJS) ◄ gated by package
        │         ├── add slug, SEO, content
        │         └── publish
        │
        ├──[2]──► Add Products
        │         └── attach to landing page
        │
        ├──[3]──► Configure Payment Gateway
        │         └── Billplz OR SenangPay (own credentials)
        │
        ├──[4]──► Configure Courier (optional, gated)
        │         └── NinjaVan / J&T API keys
        │
        └──[5]──► Add Custom Domain (optional, gated)
                  ├── add CNAME → lpage.my
                  ├── verify DNS
                  └── auto SSL via Let's Encrypt HTTP-01
```

### 14.4 Customer Checkout Flow

```
   Visitor → johnshop.lpage.my/promo
       │
       ▼
   ┌──────────────────┐
   │ Landing Page     │
   │ (rendered HTML)  │
   └────────┬─────────┘
            │ click "Buy Now"
            ▼
   ┌──────────────────┐
   │ Checkout Form    │  (single-product OR cart mode)
   │ name/email/addr  │
   └────────┬─────────┘
            │ submit
            ▼
   ┌──────────────────┐
   │ Create Order     │  status: pending
   │ (orders table)   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Redirect to      │  ◄── subscriber's gateway
   │ Billplz/SenangPay│      (NOT admin's)
   └────────┬─────────┘
            │
            ├─ success ─► Webhook → mark paid
            │             └─► trigger courier API (if enabled)
            │                  └─► generate AWB PDF
            │                       └─► email/whatsapp customer
            │
            └─ fail ─────► mark failed, retry option
```

### 14.5 SaaS Billing Flow (subscriber pays admin)

```
   ┌────────────┐
   │ New Signup │
   └─────┬──────┘
         │
         ▼
   ┌──────────────────────┐
   │ TRIAL (15 days)      │  ◄── admin-configurable
   │ - subdomain only     │
   │ - 1 page             │
   │ - TinyMCE only       │
   │ - no courier         │
   └─────┬────────────────┘
         │
         ▼  trial ending
   ┌──────────────────────┐
   │ Pick Package         │
   │ (Starter/Pro/Biz)    │
   └─────┬────────────────┘
         │
         ▼
   ┌──────────────────────┐
   │ Pay via Billplz      │  ◄── admin's Billplz
   │ (admin's gateway)    │
   └─────┬────────────────┘
         │ webhook
         ▼
   ┌──────────────────────┐
   │ Activate Subscription│
   │ unlock features      │
   └──────────────────────┘
```

---

## 15. Next Step

Once Fakrul approves this plan:
1. Create MemoryCore profile (`~/Desktop/MemoryCore Project/Projects/26-lpage.md`)
2. Register profile in global CLAUDE.md index
3. Start Phase 1 — Foundation
