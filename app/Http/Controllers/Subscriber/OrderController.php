<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $q = $request->input('q');
        $status = $request->input('status');

        $orders = Order::where('user_id', $request->user()->id)
            ->when($q, fn ($w) => $w->where(function ($x) use ($q) {
                $x->where('order_number', 'like', "%$q%")
                  ->orWhere('customer_name', 'like', "%$q%")
                  ->orWhere('customer_email', 'like', "%$q%");
            }))
            ->when($status, fn ($w) => $w->where('payment_status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('subscriber/orders/index', [
            'orders' => $orders,
            'filters' => ['q' => $q, 'status' => $status],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $q = $request->input('q');
        $status = $request->input('status');
        $userId = $request->user()->id;

        $filename = 'orders-' . now()->format('Ymd-His') . '.csv';

        return new StreamedResponse(function () use ($q, $status, $userId) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
            fputcsv($out, [
                'Order #', 'Date', 'Customer', 'Email', 'Phone',
                'Items', 'Subtotal', 'Shipping', 'Total',
                'Payment Status', 'Gateway', 'Paid At',
                'Fulfillment', 'Shipping Address', 'City', 'Postcode', 'State',
                'Page',
            ], ',', '"', '\\');

            Order::where('user_id', $userId)
                ->when($q, fn ($w) => $w->where(function ($x) use ($q) {
                    $x->where('order_number', 'like', "%$q%")
                      ->orWhere('customer_name', 'like', "%$q%")
                      ->orWhere('customer_email', 'like', "%$q%");
                }))
                ->when($status, fn ($w) => $w->where('payment_status', $status))
                ->with(['items:id,order_id,product_name,qty', 'landingPage:id,title'])
                ->orderByDesc('id')
                ->chunk(500, function ($orders) use ($out) {
                    foreach ($orders as $o) {
                        $items = $o->items->map(fn ($i) => "{$i->product_name} x{$i->qty}")->implode('; ');
                        fputcsv($out, [
                            $o->order_number,
                            optional($o->created_at)->format('Y-m-d H:i'),
                            $o->customer_name,
                            $o->customer_email,
                            $o->customer_phone,
                            $items,
                            number_format((float) $o->subtotal, 2, '.', ''),
                            number_format((float) $o->shipping_fee, 2, '.', ''),
                            number_format((float) $o->total, 2, '.', ''),
                            $o->payment_status,
                            $o->payment_gateway,
                            optional($o->paid_at)->format('Y-m-d H:i'),
                            $o->fulfillment_status,
                            $o->shipping_address,
                            $o->shipping_city,
                            $o->shipping_postcode,
                            $o->shipping_state,
                            $o->landingPage?->title,
                        ], ',', '"', '\\');
                    }
                });

            fclose($out);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_if($order->user_id !== $request->user()->id, 403);
        $order->load(['items', 'landingPage:id,title,slug', 'shipment']);
        $package = $request->user()->activeSubscription?->package;

        return Inertia::render('subscriber/orders/show', [
            'order' => $order,
            'can_connect_courier' => (bool) $package?->can_connect_courier,
            'can_print_awb' => (bool) $package?->can_print_awb,
        ]);
    }
}
