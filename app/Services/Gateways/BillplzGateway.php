<?php

namespace App\Services\Gateways;

use App\Models\Order;
use App\Models\UserPaymentSetting;
use Illuminate\Support\Facades\Http;

class BillplzGateway
{
    public function createBill(Order $order, UserPaymentSetting $setting): array
    {
        $creds = $setting->credentials->toArray();
        $base = $setting->is_sandbox
            ? 'https://www.billplz-sandbox.com/api/v3'
            : 'https://www.billplz.com/api/v3';

        $callbackUrl = url("/webhooks/billplz/{$order->user_id}");
        $redirectUrl = url("/checkout/return/{$order->order_number}");

        $payload = [
            'collection_id' => $creds['collection_id'] ?? '',
            'description' => "Order #{$order->order_number}",
            'email' => $order->customer_email,
            'name' => $order->customer_name,
            'amount' => (int) round((float) $order->total * 100),
            'callback_url' => $callbackUrl,
            'redirect_url' => $redirectUrl,
            'reference_1_label' => 'Order',
            'reference_1' => $order->order_number,
        ];

        $resp = Http::withBasicAuth($creds['api_key'] ?? '', '')
            ->asForm()
            ->post("{$base}/bills", $payload);

        if (! $resp->successful()) {
            abort(502, 'Failed to create payment bill: ' . $resp->body());
        }

        $bill = $resp->json();

        return [
            'reference' => $bill['id'] ?? null,
            'redirect' => $bill['url'] ?? '',
        ];
    }

    public function verifyCallback(array $payload, UserPaymentSetting $setting): bool
    {
        $creds = $setting->credentials->toArray();
        $signature = $creds['x_signature'] ?? null;

        if (! $signature) {
            return true;
        }

        $sourceKeys = ['amount', 'collection_id', 'due_at', 'email', 'id', 'mobile', 'name',
            'paid_amount', 'paid_at', 'paid', 'reference_1', 'reference_1_label',
            'reference_2', 'reference_2_label', 'state', 'url'];

        $parts = [];
        foreach ($sourceKeys as $k) {
            if (array_key_exists($k, $payload)) {
                $parts[] = "{$k}{$payload[$k]}";
            }
        }
        $source = implode('|', $parts);
        $expected = hash_hmac('sha256', $source, $signature);

        return isset($payload['x_signature']) && hash_equals($expected, $payload['x_signature']);
    }

    public function isPaid(array $payload): bool
    {
        return ($payload['paid'] ?? '') === 'true' || ($payload['paid'] ?? null) === true;
    }
}
