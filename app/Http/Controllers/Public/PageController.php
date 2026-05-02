<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\PageView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function show(Request $request, ?string $slug = null)
    {
        $user = $request->attributes->get('resolved_user');

        if (! $user) {
            $user = User::where('subscriber_slug', $request->route('subscriberSlug'))
                ->where('role', 'subscriber')
                ->first();
        }

        abort_if(! $user, 404, 'Site not found');

        $page = $slug
            ? LandingPage::where('user_id', $user->id)
                ->where('slug', $slug)
                ->where('is_published', true)
                ->first()
            : LandingPage::where('user_id', $user->id)
                ->where('is_homepage', true)
                ->where('is_published', true)
                ->first();

        if (! $page) {
            $page = LandingPage::where('user_id', $user->id)
                ->where('is_published', true)
                ->orderBy('created_at')
                ->first();
        }

        abort_if(! $page, 404, 'Page not found');

        $page->increment('views_count');

        $visitorId = $request->cookie('lpage_vid');
        if (! $visitorId) {
            $visitorId = (string) Str::uuid();
        }

        PageView::create([
            'user_id' => $user->id,
            'landing_page_id' => $page->id,
            'visitor_id' => $visitorId,
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 512),
            'referrer' => substr((string) $request->headers->get('referer', ''), 0, 512) ?: null,
            'viewed_at' => now(),
        ]);

        $page->load(['products' => fn ($q) => $q->where('is_active', true)->orderBy('landing_page_products.sort_order')]);

        $title = $page->seo_title ?: $page->title;
        $description = $page->seo_description ?? '';
        $ogImage = $page->og_image ?? '';

        $body = $page->content_html ?? '';
        if ($page->products->count() > 0) {
            $body .= $this->productsBlock($user, $page);
        }

        $html = $this->wrap($title, $description, $ogImage, $body);

        return (new Response($html, 200, ['Content-Type' => 'text/html; charset=utf-8']))
            ->withCookie(cookie('lpage_vid', $visitorId, 60 * 24 * 365));
    }

    private function productsBlock(User $user, LandingPage $page): string
    {
        $checkoutBase = url("/checkout/{$user->subscriber_slug}/{$page->slug}");
        $cards = '';

        foreach ($page->products as $p) {
            $img = $p->images && count($p->images) > 0
                ? asset('storage/' . $p->images[0])
                : 'https://via.placeholder.com/400x300?text=No+Image';

            $name = htmlspecialchars($p->name, ENT_QUOTES);
            $desc = htmlspecialchars(\Illuminate\Support\Str::limit(strip_tags($p->description ?? ''), 120), ENT_QUOTES);
            $price = number_format((float) $p->price, 2);
            $buyUrl = $checkoutBase . '?product=' . $p->id;

            $cards .= <<<HTML
<div class="lpage-card">
    <img src="{$img}" alt="{$name}">
    <div class="lpage-card-body">
        <h3>{$name}</h3>
        <p>{$desc}</p>
        <div class="lpage-price">RM {$price}</div>
        <a href="{$buyUrl}" class="lpage-buy">Buy Now</a>
    </div>
</div>
HTML;
        }

        return <<<HTML
<style>
.lpage-products{max-width:1100px;margin:40px auto;padding:0 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.lpage-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05);display:flex;flex-direction:column}
.lpage-card img{width:100%;height:200px;object-fit:cover;display:block}
.lpage-card-body{padding:16px;display:flex;flex-direction:column;flex:1}
.lpage-card h3{margin:0 0 8px;font-size:18px;color:#111}
.lpage-card p{margin:0 0 12px;font-size:14px;color:#555;flex:1}
.lpage-price{font-size:20px;font-weight:700;color:#0d6efd;margin-bottom:12px}
.lpage-buy{display:block;text-align:center;background:#0d6efd;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600}
.lpage-buy:hover{background:#0b5ed7}
</style>
<div class="lpage-products">{$cards}</div>
HTML;
    }

    private function wrap(string $title, string $description, string $ogImage, string $body): string
    {
        $title = htmlspecialchars($title, ENT_QUOTES);
        $description = htmlspecialchars($description, ENT_QUOTES);
        $ogImage = htmlspecialchars($ogImage, ENT_QUOTES);

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{$title}</title>
<meta name="description" content="{$description}">
<meta property="og:title" content="{$title}">
<meta property="og:description" content="{$description}">
<meta property="og:image" content="{$ogImage}">
<meta property="og:type" content="website">
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}</style>
</head>
<body>
{$body}
</body>
</html>
HTML;
    }
}
