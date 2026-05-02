<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\UserPaymentSetting;
use App\Services\Gateways\BillplzGateway;
use App\Services\Gateways\SenangPayGateway;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function init(Request $request, string $userSlug, string $pageSlug): Response
    {
        [$user, $page] = $this->resolve($userSlug, $pageSlug);

        $items = $this->collectItems($request, $page);
        abort_if(empty($items), 404, 'No products selected');

        $subtotal = collect($items)->sum(fn ($i) => $i['price'] * $i['qty']);

        return Inertia::render('public/checkout/form', [
            'user' => ['id' => $user->id, 'subscriber_slug' => $user->subscriber_slug],
            'page' => ['id' => $page->id, 'title' => $page->title, 'slug' => $page->slug, 'checkout_mode' => $page->checkout_mode],
            'items' => $items,
            'subtotal' => $subtotal,
            'gateway' => $this->defaultGateway($user)?->gateway,
        ]);
    }

    public function store(Request $request, string $userSlug, string $pageSlug)
    {
        [$user, $page] = $this->resolve($userSlug, $pageSlug);

        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:120'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'shipping_address' => ['nullable', 'string', 'max:500'],
            'shipping_city' => ['nullable', 'string', 'max:80'],
            'shipping_postcode' => ['nullable', 'string', 'max:10'],
            'shipping_state' => ['nullable', 'string', 'max:60'],
            'note' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $setting = $this->defaultGateway($user);
        abort_if(! $setting, 422, 'Seller has not configured a payment gateway');

        $productIds = collect($data['items'])->pluck('product_id')->all();
        $products = Product::where('user_id', $user->id)
            ->whereIn('id', $productIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        abort_if($products->count() !== count($productIds), 422, 'One or more products are unavailable');

        $order = DB::transaction(function () use ($user, $page, $data, $products, $setting) {
            $subtotal = 0;
            $rows = [];
            foreach ($data['items'] as $item) {
                $p = $products[$item['product_id']];
                $line = (float) $p->price * (int) $item['qty'];
                $subtotal += $line;
                $rows[] = [
                    'product_id' => $p->id,
                    'product_name' => $p->name,
                    'qty' => (int) $item['qty'],
                    'price' => $p->price,
                    'subtotal' => $line,
                ];
            }

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id' => $user->id,
                'landing_page_id' => $page->id,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'shipping_city' => $data['shipping_city'] ?? null,
                'shipping_postcode' => $data['shipping_postcode'] ?? null,
                'shipping_state' => $data['shipping_state'] ?? null,
                'subtotal' => $subtotal,
                'shipping_fee' => 0,
                'total' => $subtotal,
                'payment_status' => 'pending',
                'payment_gateway' => $setting->gateway,
                'fulfillment_status' => 'pending',
                'note' => $data['note'] ?? null,
            ]);

            foreach ($rows as $row) {
                OrderItem::create(['order_id' => $order->id] + $row);
            }

            return $order;
        });

        $gateway = $this->makeGateway($setting);
        $url = $gateway->createBill($order, $setting);

        $order->update(['gateway_ref' => $url['reference'] ?? null]);

        app(NotificationService::class)->dispatch(
            'order.placed',
            ['name' => $order->customer_name, 'email' => $order->customer_email, 'phone' => $order->customer_phone],
            [
                'order_number' => $order->order_number,
                'total' => number_format((float) $order->total, 2),
                'items' => $order->items->map(fn ($i) => [
                    'name' => $i->product_name,
                    'qty' => $i->qty,
                    'subtotal' => number_format((float) $i->subtotal, 2),
                ])->all(),
            ],
            $order,
            $user->id,
        );

        return Inertia::location($url['redirect']);
    }

    public function success(string $orderNumber): Response
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->load('items');

        return Inertia::render('public/checkout/success', [
            'order' => $order,
        ]);
    }

    public function failed(string $orderNumber): Response
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        return Inertia::render('public/checkout/failed', [
            'order' => $order,
        ]);
    }

    private function resolve(string $userSlug, string $pageSlug): array
    {
        $user = User::where('subscriber_slug', $userSlug)->where('role', 'subscriber')->firstOrFail();
        $page = LandingPage::where('user_id', $user->id)
            ->where('slug', $pageSlug)
            ->where('is_published', true)
            ->firstOrFail();

        return [$user, $page];
    }

    private function collectItems(Request $request, LandingPage $page): array
    {
        $page->load(['products' => fn ($q) => $q->where('is_active', true)->orderBy('landing_page_products.sort_order')]);

        if ($page->checkout_mode === 'single') {
            $productId = (int) $request->input('product');
            $product = $page->products->firstWhere('id', $productId) ?: $page->products->first();
            if (! $product) return [];
            return [[
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'qty' => 1,
                'image' => $product->images && count($product->images) > 0 ? asset('storage/' . $product->images[0]) : null,
            ]];
        }

        return $page->products->map(fn ($p) => [
            'product_id' => $p->id,
            'name' => $p->name,
            'price' => (float) $p->price,
            'qty' => 1,
            'image' => $p->images && count($p->images) > 0 ? asset('storage/' . $p->images[0]) : null,
        ])->all();
    }

    private function defaultGateway(User $user): ?UserPaymentSetting
    {
        return UserPaymentSetting::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->first();
    }

    private function makeGateway(UserPaymentSetting $setting)
    {
        return match ($setting->gateway) {
            'billplz' => app(BillplzGateway::class),
            'senangpay' => app(SenangPayGateway::class),
            default => abort(422, 'Unsupported gateway'),
        };
    }
}
