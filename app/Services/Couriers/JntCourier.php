<?php

namespace App\Services\Couriers;

use App\Models\Order;
use App\Models\UserCourierSetting;
use Illuminate\Support\Facades\Http;

class JntCourier implements CourierContract
{
    public function createShipment(Order $order, UserCourierSetting $setting): array
    {
        $creds = $setting->credentials->toArray();
        $base = $setting->is_sandbox
            ? 'https://uat.jtexpress.my/yundaapi'
            : 'https://api.jtexpress.my/yundaapi';

        $bizContent = [
            'customerCode' => $creds['customer_code'] ?? '',
            'orderId' => $order->order_number,
            'expressType' => 'EZ',
            'serviceType' => '01',
            'sender' => [
                'name' => $order->user->name ?? 'Seller',
                'mobile' => $creds['pickup_phone'] ?? '',
                'prov' => $creds['pickup_state'] ?? '',
                'city' => $creds['pickup_city'] ?? '',
                'address' => $creds['pickup_address'] ?? '',
                'postCode' => $creds['pickup_postcode'] ?? '',
            ],
            'receiver' => [
                'name' => $order->customer_name,
                'mobile' => $order->customer_phone ?? '',
                'prov' => $order->shipping_state ?? '',
                'city' => $order->shipping_city ?? '',
                'address' => $order->shipping_address ?? '',
                'postCode' => $order->shipping_postcode ?? '',
            ],
            'items' => collect($order->items)->map(fn ($i) => [
                'itemName' => $i->product_name,
                'number' => $i->qty,
            ])->all(),
            'totalQuantity' => (int) $order->items->sum('qty'),
            'weight' => 1.0,
        ];

        $bizJson = json_encode($bizContent);
        $sign = base64_encode(md5($bizJson . ($creds['private_key'] ?? ''), true));

        $resp = Http::asForm()->post("{$base}/order/addOrder", [
            'bizContent' => $bizJson,
            'digest' => $sign,
            'apiAccount' => $creds['api_account'] ?? '',
            'timestamp' => (string) (time() * 1000),
        ]);

        if (! $resp->successful()) {
            abort(502, 'J&T create order failed: ' . $resp->body());
        }

        $data = $resp->json();
        $awb = $data['data']['awb'] ?? $data['data']['txlogisticId'] ?? ('JT' . strtoupper(substr(uniqid(), -10)));

        return [
            'awb_number' => $awb,
            'tracking_url' => "https://www.jtexpress.my/track?awb={$awb}",
            'raw' => $data,
        ];
    }

    public function trackShipment(string $awbNumber, UserCourierSetting $setting): array
    {
        $creds = $setting->credentials->toArray();
        $base = $setting->is_sandbox
            ? 'https://uat.jtexpress.my/yundaapi'
            : 'https://api.jtexpress.my/yundaapi';

        $bizContent = json_encode(['awb' => $awbNumber]);
        $sign = base64_encode(md5($bizContent . ($creds['private_key'] ?? ''), true));

        $resp = Http::asForm()->post("{$base}/logistics/trace", [
            'bizContent' => $bizContent,
            'digest' => $sign,
            'apiAccount' => $creds['api_account'] ?? '',
            'timestamp' => (string) (time() * 1000),
        ]);

        if (! $resp->successful()) {
            return ['status' => 'unknown', 'raw' => ['error' => $resp->body()]];
        }

        $data = $resp->json();
        $events = $data['data']['details'] ?? [];
        $latest = end($events);
        $status = $this->mapStatus($latest['scanType'] ?? '');

        return ['status' => $status, 'raw' => $data];
    }

    private function mapStatus(string $raw): string
    {
        $r = strtolower($raw);
        if (str_contains($r, 'delivered') || $r === '120') return 'delivered';
        if (str_contains($r, 'transit') || $r === '110') return 'in_transit';
        if (str_contains($r, 'pickup') || str_contains($r, 'collect') || $r === '100') return 'picked_up';
        if (str_contains($r, 'fail') || str_contains($r, 'return')) return 'failed';
        return 'created';
    }
}
