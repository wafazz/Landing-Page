<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shipment;
use App\Models\UserCourierSetting;
use App\Services\Couriers\CourierContract;
use App\Services\Couriers\JntCourier;
use App\Services\Couriers\NinjaVanCourier;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\Log;

class ShipmentService
{
    public function createForOrder(Order $order): ?Shipment
    {
        if ($order->shipment) {
            return $order->shipment;
        }

        $setting = UserCourierSetting::where('user_id', $order->user_id)
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->first();

        if (! $setting) {
            return null;
        }

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'courier' => $setting->courier,
            'status' => 'pending',
        ]);

        try {
            $courier = $this->driver($setting->courier);
            $result = $courier->createShipment($order->loadMissing('items', 'user'), $setting);

            $shipment->update([
                'awb_number' => $result['awb_number'],
                'tracking_url' => $result['tracking_url'],
                'status' => 'created',
                'raw_response' => $result['raw'],
                'shipped_at' => now(),
            ]);

            $order->update(['fulfillment_status' => 'shipped']);

            try {
                app(NotificationService::class)->dispatch(
                    'shipment.created',
                    ['name' => $order->customer_name, 'email' => $order->customer_email, 'phone' => $order->customer_phone],
                    [
                        'order_number' => $order->order_number,
                        'courier' => strtoupper($shipment->courier),
                        'awb_number' => $shipment->awb_number,
                        'tracking_url' => $shipment->tracking_url,
                    ],
                    $order,
                    $order->user_id,
                );
            } catch (\Throwable $ne) {
                Log::warning('Shipment notification skipped', ['order' => $order->order_number, 'error' => $ne->getMessage()]);
            }
        } catch (\Throwable $e) {
            Log::error('Shipment creation failed', [
                'order' => $order->order_number,
                'courier' => $setting->courier,
                'error' => $e->getMessage(),
            ]);
            $shipment->update(['status' => 'failed', 'raw_response' => ['error' => $e->getMessage()]]);
        }

        return $shipment->fresh();
    }

    public function track(Shipment $shipment): Shipment
    {
        if (! $shipment->awb_number) {
            return $shipment;
        }

        $setting = UserCourierSetting::where('user_id', $shipment->user_id)
            ->where('courier', $shipment->courier)
            ->first();

        if (! $setting) {
            return $shipment;
        }

        $result = $this->driver($shipment->courier)->trackShipment($shipment->awb_number, $setting);
        $shipment->update([
            'status' => $result['status'],
            'raw_response' => $result['raw'],
            'delivered_at' => $result['status'] === 'delivered' ? ($shipment->delivered_at ?: now()) : $shipment->delivered_at,
        ]);

        if ($result['status'] === 'delivered') {
            $shipment->order->update(['fulfillment_status' => 'delivered']);
        }

        return $shipment->fresh();
    }

    private function driver(string $courier): CourierContract
    {
        return match ($courier) {
            'ninjavan' => app(NinjaVanCourier::class),
            'jnt' => app(JntCourier::class),
            default => throw new \InvalidArgumentException("Unknown courier: {$courier}"),
        };
    }
}
