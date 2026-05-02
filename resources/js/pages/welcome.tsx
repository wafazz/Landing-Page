import { Head, Link } from '@inertiajs/react';
import { Accordion, Button, Container, Navbar } from 'react-bootstrap';

type Package = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string | number;
    billing_cycle: string;
    tag: string;
    max_landing_pages: number;
    max_products: number | null;
    can_use_drag_drop: boolean;
    can_connect_courier: boolean;
    can_print_awb: boolean;
    can_use_custom_domain: boolean;
};

type Props = {
    packages: Package[];
};

const features = [
    {
        icon: 'bi-magic',
        title: 'Drag & Drop Builder',
        text: 'Design pixel-perfect pages with GrapesJS. No code, no designer, no excuses — ship in minutes.',
    },
    {
        icon: 'bi-cart-check',
        title: 'Built-in Checkout',
        text: 'Single-product or full cart mode. Connect Billplz or SenangPay and start collecting payments today.',
    },
    {
        icon: 'bi-truck',
        title: 'Auto-Shipping',
        text: 'NinjaVan & J&T plug right in. Orders auto-create AWBs and email tracking to customers — hands-off.',
    },
    {
        icon: 'bi-globe2',
        title: 'Custom Domains',
        text: 'Use your own .com (or .my) with auto-renewing SSL. We handle the certs — you handle the brand.',
    },
    {
        icon: 'bi-graph-up-arrow',
        title: 'Real-time Analytics',
        text: 'Unique visitors, conversion rates, top referrers, daily charts. Know what works, kill what doesn\'t.',
    },
    {
        icon: 'bi-bell',
        title: 'Email + WhatsApp',
        text: 'Order placed, shipped, refunded — auto-notify your customers via Brevo email & Onsend WhatsApp.',
    },
];

const steps = [
    { num: 1, title: 'Sign up free', text: '15-day trial, no card required. Pick your subdomain and you\'re live.' },
    { num: 2, title: 'Build your page', text: 'Drag, drop, write, publish. Add products, photos, and your checkout.' },
    { num: 3, title: 'Connect gateway', text: 'Plug in Billplz or SenangPay. Money goes straight to your account.' },
    { num: 4, title: 'Start selling', text: 'Share your link, run ads, watch orders roll in. We handle the AWB.' },
];

const testimonials = [
    {
        initials: 'AR',
        name: 'Aisyah R.',
        role: 'Skincare Brand Owner',
        quote: 'Switched from Shopify and saved RM200/month. The drag & drop is way faster, and J&T integration just works.',
    },
    {
        initials: 'MH',
        name: 'Marzuki H.',
        role: 'Dropshipper',
        quote: 'I run 8 landing pages from one dashboard. Print AWB in one click. Built for Malaysian sellers.',
    },
    {
        initials: 'SF',
        name: 'Siti F.',
        role: 'Bakery Owner',
        quote: 'Set up my first page in under an hour. Customers pay with FPX and I get WhatsApp notifications. Love it.',
    },
];

const faqs = [
    {
        q: 'Do I need coding skills?',
        a: 'Not at all. Pick a template, drag elements where you want them, edit text inline. If you can use Canva, you can use LPage.',
    },
    {
        q: 'How does payment work?',
        a: 'You connect your own Billplz or SenangPay account. Customers pay you directly — we never touch your money. We charge a flat monthly subscription, that\'s it.',
    },
    {
        q: 'Can I use my own domain?',
        a: 'Yes, on the Business plan. Just point a CNAME to lpage.my and we auto-issue Let\'s Encrypt SSL. Renewal is automatic.',
    },
    {
        q: 'What about courier and AWB?',
        a: 'Pro and Business plans include NinjaVan and J&T integration. When an order is paid, the AWB is auto-generated and your customer gets the tracking number.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. Cancel from your dashboard, no questions asked. Your pages stay live until the end of your billing cycle.',
    },
    {
        q: 'Is there a free trial?',
        a: 'Yes — 15 days, no credit card. You get a subdomain, 1 landing page, and the basic editor. Upgrade anytime to unlock more.',
    },
];

function buildFeatureList(p: Package) {
    const unlimited = p.max_products === null;
    return [
        { ok: true, label: `${p.max_landing_pages} landing page${p.max_landing_pages > 1 ? 's' : ''}` },
        { ok: true, label: unlimited ? 'Unlimited products' : `${p.max_products} products` },
        { ok: true, label: 'TinyMCE editor' },
        { ok: p.can_use_drag_drop, label: 'Drag & drop builder (GrapesJS)' },
        { ok: p.can_connect_courier, label: 'Courier integration (NinjaVan + J&T)' },
        { ok: p.can_print_awb, label: 'AWB label printing' },
        { ok: p.can_use_custom_domain, label: 'Custom domain + SSL' },
        { ok: true, label: 'Email + WhatsApp notifications' },
        { ok: true, label: 'Real-time analytics' },
    ];
}

export default function Welcome({ packages = [] }: Props) {
    const featuredSlug = packages.find((p) => p.slug === 'pro')?.slug ?? packages[1]?.slug;

    return (
        <>
            <Head title="LPage.my — Build, Sell, Ship. All from one landing page." />

            {/* Nav */}
            <Navbar expand="lg" className="lp-nav py-3">
                <Container>
                    <Navbar.Brand as={Link} href="/" className="fw-bold fs-4 text-primary">
                        <i className="bi bi-lightning-charge-fill me-2"></i>LPage<span className="text-dark">.my</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="lp-navbar" />
                    <Navbar.Collapse id="lp-navbar" className="justify-content-end">
                        <div className="d-flex flex-column flex-lg-row gap-2 gap-lg-3 align-items-lg-center mt-3 mt-lg-0">
                            <a href="#features" className="text-secondary text-decoration-none px-2">Features</a>
                            <a href="#how-it-works" className="text-secondary text-decoration-none px-2">How it works</a>
                            <a href="#pricing" className="text-secondary text-decoration-none px-2">Pricing</a>
                            <a href="#faq" className="text-secondary text-decoration-none px-2">FAQ</a>
                            <Link href="/login" className="btn btn-link text-secondary text-decoration-none px-2">
                                Login
                            </Link>
                            <Link href="/register">
                                <Button variant="primary" className="px-3">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero */}
            <section className="lp-hero">
                <Container>
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <span className="lp-hero-eyebrow">
                                <i className="bi bi-stars"></i> Built for Malaysian sellers
                            </span>
                            <h1 className="mb-3">
                                Build, sell, ship.
                                <br />
                                <span className="lp-grad">All from one landing page.</span>
                            </h1>
                            <p className="lead mb-4">
                                Drag-and-drop landing pages with built-in checkout, courier, and AWB. Launch your store in
                                minutes — keep 100% of your sales.
                            </p>
                            <div className="d-flex flex-wrap gap-3 mb-4">
                                <Link href="/register">
                                    <Button variant="primary" size="lg" className="px-4">
                                        <i className="bi bi-rocket-takeoff me-2"></i>Start 15-Day Free Trial
                                    </Button>
                                </Link>
                                <a href="#how-it-works" className="btn btn-outline-secondary btn-lg px-4">
                                    <i className="bi bi-play-circle me-2"></i>See how it works
                                </a>
                            </div>
                            <div className="d-flex flex-wrap gap-4 text-secondary small">
                                <span><i className="bi bi-check-circle-fill text-success me-2"></i>No credit card required</span>
                                <span><i className="bi bi-check-circle-fill text-success me-2"></i>Cancel anytime</span>
                                <span><i className="bi bi-check-circle-fill text-success me-2"></i>Setup in 5 mins</span>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="lp-hero-mock">
                                <div className="lp-hero-mock-bar">
                                    <span></span><span></span><span></span>
                                </div>
                                <div className="lp-hero-mock-body">
                                    <div className="bg-white rounded-3 p-3 mb-3 shadow-sm">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="lp-feature-icon" style={{ width: 44, height: 44, fontSize: 20, marginBottom: 0 }}>
                                                <i className="bi bi-bag-heart"></i>
                                            </div>
                                            <div>
                                                <div className="fw-semibold text-dark">Glow Serum 30ml</div>
                                                <div className="small text-secondary">RM 89.00</div>
                                            </div>
                                            <span className="badge bg-success ms-auto">In stock</span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-3 p-3 shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="small text-secondary">Today's orders</span>
                                            <span className="badge bg-primary-subtle text-primary">+24%</span>
                                        </div>
                                        <div className="display-6 fw-bold text-dark mb-1">RM 2,847</div>
                                        <div className="small text-secondary">
                                            <i className="bi bi-graph-up-arrow text-success me-1"></i>
                                            42 orders · 1,284 visits · 3.27% CR
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lp-stat-row">
                        <div className="text-center">
                            <div className="lp-stat-num">2,400+</div>
                            <div className="lp-stat-label">Active sellers</div>
                        </div>
                        <div className="text-center">
                            <div className="lp-stat-num">RM 18M+</div>
                            <div className="lp-stat-label">Processed</div>
                        </div>
                        <div className="text-center">
                            <div className="lp-stat-num">99.9%</div>
                            <div className="lp-stat-label">Uptime</div>
                        </div>
                        <div className="text-center">
                            <div className="lp-stat-num">5 min</div>
                            <div className="lp-stat-label">Avg setup</div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Features */}
            <section id="features" className="lp-section">
                <Container>
                    <div className="text-center mb-5">
                        <div className="section-eyebrow mb-2">Everything you need</div>
                        <h2 className="mb-3">One platform. Endless possibilities.</h2>
                        <p className="text-secondary mx-auto" style={{ maxWidth: 600 }}>
                            From the first click to the AWB sticker, LPage handles every step so you can focus on growing
                            your brand.
                        </p>
                    </div>
                    <div className="row g-4">
                        {features.map((f) => (
                            <div key={f.title} className="col-md-6 col-lg-4">
                                <div className="lp-feature-card">
                                    <div className="lp-feature-icon">
                                        <i className={`bi ${f.icon}`}></i>
                                    </div>
                                    <h5 className="fw-bold mb-2">{f.title}</h5>
                                    <p className="text-secondary mb-0">{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="lp-section lp-section-alt">
                <Container>
                    <div className="text-center mb-5">
                        <div className="section-eyebrow mb-2">How it works</div>
                        <h2 className="mb-3">From signup to first sale in 4 steps</h2>
                    </div>
                    <div className="row g-4">
                        {steps.map((s) => (
                            <div key={s.num} className="col-md-6 col-lg-3">
                                <div className="lp-step">
                                    <div className="lp-step-num">{s.num}</div>
                                    <h6 className="fw-bold mb-2">{s.title}</h6>
                                    <p className="text-secondary small mb-0">{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Pricing */}
            <section id="pricing" className="lp-section">
                <Container>
                    <div className="text-center mb-5">
                        <div className="section-eyebrow mb-2">Simple pricing</div>
                        <h2 className="mb-3">Plans that grow with you</h2>
                        <p className="text-secondary">No hidden fees. No transaction cuts. Cancel anytime.</p>
                    </div>
                    {packages.length === 0 ? (
                        <p className="text-center text-secondary">Pricing plans coming soon.</p>
                    ) : (
                        <div className="row g-4 justify-content-center">
                            {packages.map((p) => {
                                const featured = p.slug === featuredSlug;
                                const items = buildFeatureList(p);
                                return (
                                    <div key={p.id} className="col-md-6 col-lg-4">
                                        <div className={`lp-pricing-card ${featured ? 'featured' : ''}`}>
                                            <div className="text-center mb-3">
                                                <h4 className="fw-bold mb-1">{p.name}</h4>
                                                <p className="text-secondary small mb-3" style={{ minHeight: 38 }}>
                                                    {p.description}
                                                </p>
                                                <div>
                                                    <span className="lp-price">RM{Number(p.price).toFixed(0)}</span>
                                                    <span className="lp-price-cycle"> /{p.billing_cycle === 'yearly' ? 'year' : 'month'}</span>
                                                </div>
                                            </div>
                                            <ul className="lp-pricing-features">
                                                {items.map((it, i) => (
                                                    <li key={i} className={it.ok ? '' : 'dim'}>
                                                        <i
                                                            className={`bi ${it.ok ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-secondary'}`}
                                                        ></i>
                                                        <span>{it.label}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Link href="/register" className="d-grid">
                                                <Button variant={featured ? 'primary' : 'outline-primary'} size="lg">
                                                    Start Free Trial
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Container>
            </section>

            {/* Testimonials */}
            <section className="lp-section lp-section-alt">
                <Container>
                    <div className="text-center mb-5">
                        <div className="section-eyebrow mb-2">Loved by sellers</div>
                        <h2 className="mb-3">Don't take our word for it</h2>
                    </div>
                    <div className="row g-4">
                        {testimonials.map((t) => (
                            <div key={t.name} className="col-md-4">
                                <div className="lp-testimonial">
                                    <div className="lp-testimonial-stars">
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                    </div>
                                    <p className="lp-testimonial-quote">"{t.quote}"</p>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="lp-testimonial-avatar">{t.initials}</div>
                                        <div>
                                            <div className="fw-semibold text-dark small">{t.name}</div>
                                            <div className="text-secondary small">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* FAQ */}
            <section id="faq" className="lp-section">
                <Container>
                    <div className="text-center mb-5">
                        <div className="section-eyebrow mb-2">FAQ</div>
                        <h2 className="mb-3">Questions? We have answers.</h2>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <Accordion className="lp-faq">
                                {faqs.map((f, i) => (
                                    <Accordion.Item eventKey={String(i)} key={i}>
                                        <Accordion.Header>{f.q}</Accordion.Header>
                                        <Accordion.Body className="text-secondary">{f.a}</Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <section className="lp-section">
                <Container>
                    <div className="lp-cta">
                        <h2 className="mb-3">Ready to launch your store?</h2>
                        <p className="lead mb-4 mx-auto" style={{ maxWidth: 540 }}>
                            Start your 15-day free trial. No credit card. Be selling by tonight.
                        </p>
                        <Link href="/register">
                            <Button variant="light" size="lg" className="px-4 fw-semibold">
                                <i className="bi bi-rocket-takeoff me-2"></i>Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <Container>
                    <div className="row g-4">
                        <div className="col-lg-4 col-md-6">
                            <h6 className="text-white">
                                <i className="bi bi-lightning-charge-fill text-primary me-2"></i>LPage.my
                            </h6>
                            <p className="small mb-0" style={{ color: '#94a3b8' }}>
                                The all-in-one landing page builder for Malaysian e-commerce sellers. Build, sell, ship —
                                from one dashboard.
                            </p>
                        </div>
                        <div className="col-lg-2 col-md-6 col-6">
                            <h6>Product</h6>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#how-it-works">How it works</a>
                            <a href="#faq">FAQ</a>
                        </div>
                        <div className="col-lg-2 col-md-6 col-6">
                            <h6>Company</h6>
                            <a href="#">About</a>
                            <a href="#">Blog</a>
                            <a href="#">Contact</a>
                        </div>
                        <div className="col-lg-2 col-md-6 col-6">
                            <h6>Legal</h6>
                            <a href="#">Terms</a>
                            <a href="#">Privacy</a>
                            <a href="#">Refund Policy</a>
                        </div>
                        <div className="col-lg-2 col-md-6 col-6">
                            <h6>Account</h6>
                            <Link href="/login">Login</Link>
                            <Link href="/register">Sign up</Link>
                        </div>
                    </div>
                    <div className="lp-footer-bottom d-flex flex-wrap justify-content-between gap-2">
                        <span>© {new Date().getFullYear()} LPage.my — All rights reserved.</span>
                        <span>Made in Malaysia <i className="bi bi-heart-fill text-danger ms-1"></i></span>
                    </div>
                </Container>
            </footer>
        </>
    );
}
