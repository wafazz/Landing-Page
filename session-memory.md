# LPage.my — Session Memory

## Current Phase
**Phase 10 — Polish & Analytics** [✔] COMPLETE
**Project status: ALL 10 PHASES DONE — ready for final integration testing & deployment**

## Stack (LOCKED)
- Laravel 12 + Inertia + React 19 + TypeScript
- AdminLTE 4 + Bootstrap 5.3 + react-bootstrap + bootstrap-icons
- ApexCharts + NProgress + TinyMCE + GrapesJS
- DomPDF for AWB
- Database queue (no Horizon needed locally)
- MySQL port 3307, db: `l_page`

## Phase 10 Completed [✔]
- [✔] Migration: page_views (user_id, landing_page_id, visitor_id cookie, ip, ua, referrer, country, viewed_at) — indexed on (user, viewed_at) and (page, viewed_at)
- [✔] Model: PageView
- [✔] Public PageController writes a row + sets `lpage_vid` cookie (1 year) on every render — visitor_id from cookie or new UUID; views_count still increments
- [✔] DashboardController: real KPIs (pages, products, orders/revenue this month vs last month, page views, conversion rate), 30-day revenue area chart, 7-day orders bar chart, top-5 products horizontal bar, recent orders list
- [✔] AnalyticsController + page (`/analytics`): site-wide totals, dual-axis views/orders trend (7/30/90d toggle), top referrers (extracted from `SUBSTRING_INDEX(referrer,'/',3)`), per-page table with conversion rate badges
- [✔] Order CSV export: `GET /orders/export` streams UTF-8 BOM CSV with filters (q, status), 18 columns, chunked 500-row batches
- [✔] Sidebar nav: "Analytics" item (bi-graph-up)
- [✔] Fixed PHP 8.4 deprecations: nullable `?string $slug`, fputcsv escape arg

## Routes Added (Phase 10)
| Route | Purpose |
|---|---|
| GET /analytics | Per-page analytics dashboard |
| GET /orders/export | Stream filtered orders CSV |

## QA Results (smoke test, real DB)
```
/dashboard               => 200 text/html
/analytics               => 200 text/html
/orders                  => 200 text/html
/orders/export?status=paid => 200 text/csv (982 bytes, 4 rows)
/notification-prefs      => 200 text/html
public landing page      => 200 + sets lpage_vid cookie + writes page_view row
```

## Critical Files Added (Phase 10)
- `database/migrations/2026_05_02_000500_create_page_views_table.php`
- `app/Models/PageView.php`
- `app/Http/Controllers/Subscriber/AnalyticsController.php`
- `resources/js/pages/subscriber/analytics/index.tsx`
- Modified: Public PageController (visitor tracking + cookie), DashboardController (real data), OrderController (export method), routes/web.php, subscriber-layout (Analytics nav), subscriber dashboard.tsx, orders/index.tsx (export button)

## Analytics Architecture Notes
- **Visitor identity**: cookie `lpage_vid` (1y), UUID v4 if absent — set via `withCookie()` on the Response
- **Unique vs total views**: unique = `COUNT(DISTINCT visitor_id)` over window; total = COUNT(*) — both surfaced on Analytics page
- **Conversion rate**: `(orders / views) * 100`, rounded 2dp; site-wide and per-page
- **Referrer host extraction**: `SUBSTRING_INDEX(SUBSTRING_INDEX(referrer, '/', 3), '://', -1)` — works on MySQL, splits scheme+host out of full URL
- **Daily series**: backend builds labels + values arrays, pads zero days; frontend ApexCharts consumes directly
- **Window options**: 7 / 30 / 90 days (clamped server-side, default 30)
- **Top products**: aggregated from order_items joined on paid orders only, last 30 days, grouped by product_name, limit 5

## CSV Export Notes
- `StreamedResponse` + chunked Eloquent (500/batch) — safe for tens of thousands of rows
- UTF-8 BOM (`\xEF\xBB\xBF`) prepended so Excel opens it correctly
- 18 columns: Order#, Date, Customer, Email, Phone, Items, Subtotal, Shipping, Total, PaymentStatus, Gateway, PaidAt, Fulfillment, ShippingAddress, City, Postcode, State, Page
- Filters carried over via query string (q, status); export button on orders index appends current filters
- `fputcsv` called with explicit escape `'\\'` to silence PHP 8.4 deprecation

## Storage
- AWB PDFs: `storage/app/awb/{user_id}/awb-{awb_number}.pdf`
- Product images: `storage/app/public/products/{user_id}/...`

## Phases 1-10 Recap
1-7. [✔] Foundation through Products/Orders/Payment Settings (data layer)
8A. [✔] Public Checkout + Gateway Webhooks (Billplz + SenangPay)
8B. [✔] Courier Integration (NinjaVan + J&T + AWB PDF)
9. [✔] Notifications (Brevo email + Onsend WhatsApp, 4 events, queue)
10. [✔] Polish & Analytics (visitor tracking, dashboard charts, per-page analytics, CSV export)

## Test Credentials
- Admin: `admin@lpage.my` / `admin123`
- Subscriber (Pro): `test@lpage.my` / `test1234` — slug `testshop`

## Session Recap
- Phase 10 complete — project core is feature-done across all 10 planned phases
- Visitor analytics: cookie-based unique tracking, dual-axis views/orders chart, referrer breakdown
- Dashboard rebuilt from hardcoded mocks to live SQL aggregates
- CSV export streams safely with chunked queries + UTF-8 BOM for Excel
- All subscriber routes verified 200 against the seeded test data; CSV export produces 4-row file for the existing paid orders
- Next natural steps (out of scope for v1 build): production deploy via Forge, wildcard SSL, custom-domain SSL automation, Horizon if queue throughput climbs
