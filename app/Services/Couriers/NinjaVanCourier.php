<?php

namespace App\Services\Couriers;

use App\Models\Order;
use App\Models\UserCourierSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class NinjaVanCourier implements CourierContract
{
    public function createShipment(Order $order, UserCourierSetting $setting): array
    {
        $creds = $setting->credentials->toArray();
        $base = $setting->is_sandbox
            ? 'https://api-sandbox.ninjavan.co/MY/4.2'
            : 'https://api.ninjavan.co/MY/4.2';

        $token = $this->getToken($base, $creds, $setting->id);

        $payload = [
            'service_type' => 'Parcel',
            'service_level' => 'Standard',
            'requested_tracking_number' => 'LP' . $order->id . strtoupper(substr(uniqid(), -6)),
            'reference' => ['merchant_order_number' => $order->order_number],
            'from' => [
                'name' => $order->user->name ?? 'Seller',
                'phone_number' => $creds['pickup_phone'] ?? '+60123456789',
                'email' => $order->user->email ?? '',
                'address' => [
                    'address1' => $creds['pickup_address'] ?? '',
                    'city' => $creds['pickup_city'] ?? '',
                    'state' => $creds['pickup_state'] ?? '',
                    'postcode' => $creds['pickup_postcode'] ?? '',
                    'country' => 'MY',
                ],
            ],
            'to' => [
                'name' => $order->customer_name,
                'phone_number' => $order->customer_phone ?? '',
                'email' => $order->customer_email,
                'address' => [
                    'address1' => $order->shipping_address ?? '',
                    'city' => $order->shipping_city ?? '',
                    'state' => $order->shipping_state ?? '',
                    'postcode' => $order->shipping_postcode ?? '',
                    'country' => 'MY',
                ],
            ],
            'parcel_job' => [
                'is_pickup_required' => true,
                'pickup_date' => now()->addDay()->format('Y-m-d'),
                'delivery_instructions' => $order->note ?? '',
                'dimensions' => ['weight' => 1.0],
            ],
        ];

        $resp = Http::withToken($token)
            ->acceptJson()
            ->post("{$base}/orders", $payload);

        if (! $resp->successful()) {
            abort(502, 'NinjaVan create order failed: ' . $resp->body());
        }

        $data = $resp->json();
        $awb = $data['tracking_number'] ?? $payload['requested_tracking_number'];

        return [
            'awb_number' => $awb,
            'tracking_url' => "https://www.ninjavan.co/en-my/tracking?id={$awb}",
            'raw' => $data,
        ];
    }

    public function trackShipment(string $awbNumber, UserCourierSetting $setting): array
    {
        $creds = $setting->credentials->toArray();
        $base = $setting->is_sandbox
            ? 'https://api-sandbox.ninjavan.co/MY/1.0'
            : 'https://api.ninjavan.co/MY/1.0';

        $token = $this->getToken($base, $creds, $setting->id);
        $resp = Http::withToken($token)->get("{$base}/reports/orders/{$awbNumber}/events");

        if (! $resp->successful()) {
            return ['status' => 'unknown', 'raw' => ['error' => $resp->body()]];
        }

        $data = $resp->json();
        $events = $data['events'] ?? [];
        $latest = end($events);
        $status = $this->mapStatus($latest['status'] ?? 'pending');

        return ['status' => $status, 'raw' => $data];
    }

    private function getToken(string $base, array $creds, int $settingId): string
    {
        return Cache::remember("ninjavan_token:{$settingId}", 3000, function () use ($base, $creds) {
            $resp = Http::asJson()->post("{$base}/oauth/access_token", [
                'client_id' => $creds['client_id'] ?? '',
                'client_secret' => $creds['client_secret'] ?? '',
                'grant_type' => 'client_credentials',
            ]);
            if (! $resp->successful()) {
                abort(502, 'NinjaVan auth failed: ' . $resp->body());
            }
            return $resp->json('access_token');
        });
    }

    private function mapStatus(string $raw): string
    {
        $r = strtolower($raw);
        if (str_contains($r, 'delivered')) return 'delivered';
        if (str_contains($r, 'transit') || str_contains($r, 'in_transit')) return 'in_transit';
        if (str_contains($r, 'pickup') || str_contains($r, 'picked')) return 'picked_up';
        if (str_contains($r, 'fail') || str_contains($r, 'cancel')) return 'failed';
        return 'created';
    }
}
