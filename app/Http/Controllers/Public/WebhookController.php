<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\UserPaymentSetting;
use App\Services\Gateways\BillplzGateway;
use App\Services\Gateways\SenangPayGateway;
use App\Services\Notifications\NotificationService;
use App\Services\ShipmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function billplz(Request $request, int $userId)
    {
        $payload = $request->all();
        $reference = $payload['reference_1'] ?? null;

        if (! $reference) {
            return response('missing reference', 400);
        }

        $setting = UserPaymentSetting::where('user_id', $userId)->where('gateway', 'billplz')->first();
        if (! $setting) {
            return response('gateway not configured', 404);
        }

        $gateway = app(BillplzGateway::class);
        if (! $gateway->verifyCallback($payload, $setting)) {
            Log::warning('Billplz signature mismatch', ['user_id' => $userId, 'ref' => $reference]);
            return response('invalid signature', 403);
        }

        $order = Order::where('user_id', $userId)->where('order_number', $reference)->first();
        if (! $order) {
            return response('order not found', 404);
        }

        if ($gateway->isPaid($payload)) {
            $this->markPaid($order, $payload['id'] ?? $order->gateway_ref);
        } else {
            $order->update(['payment_status' => 'failed']);
        }

        return response('ok', 200);
    }

    public function senangpay(Request $request, int $userId)
    {
        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;

        if (! $orderId) {
            return response('missing order_id', 400);
        }

        $setting = UserPaymentSetting::where('user_id', $userId)->where('gateway', 'senangpay')->first();
        if (! $setting) {
            return response('gateway not configured', 404);
        }

        $gateway = app(SenangPayGateway::class);
        if (! $gateway->verifyCallback($payload, $setting)) {
            Log::warning('SenangPay signature mismatch', ['user_id' => $userId, 'order' => $orderId]);
            return response('invalid signature', 403);
        }

        $order = Order::where('user_id', $userId)->where('order_number', $orderId)->first();
        if (! $order) {
            return response('order not found', 404);
        }

        if ($gateway->isPaid($payload)) {
            $this->markPaid($order, $payload['transaction_id'] ?? null);
        } else {
            $order->update(['payment_status' => 'failed']);
        }

        return response('ok', 200);
    }

    public function returnUrl(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($order->payment_status === 'paid') {
            return redirect("/checkout/success/{$order->order_number}");
        }

        return redirect("/checkout/failed/{$order->order_number}");
    }

    private function markPaid(Order $order, ?string $reference): void
    {
        if ($order->payment_status === 'paid') {
            return;
        }

        $order->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
            'gateway_ref' => $reference ?? $order->gateway_ref,
        ]);

        try {
            app(NotificationService::class)->dispatch(
                'payment.received',
                ['name' => $order->customer_name, 'email' => $order->customer_email, 'phone' => $order->customer_phone],
                [
                    'order_number' => $order->order_number,
                    'total' => number_format((float) $order->total, 2),
                    'payment_gateway' => $order->payment_gateway,
                ],
                $order,
                $order->user_id,
            );
        } catch (\Throwable $e) {
            Log::warning('Payment notification skipped', ['order' => $order->order_number, 'error' => $e->getMessage()]);
        }

        try {
            app(ShipmentService::class)->createForOrder($order->fresh());
        } catch (\Throwable $e) {
            Log::warning('Auto-shipment skipped', ['order' => $order->order_number, 'error' => $e->getMessage()]);
        }
    }
}
