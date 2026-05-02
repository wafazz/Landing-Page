<?php

namespace App\Services\Couriers;

use App\Models\Order;
use App\Models\UserCourierSetting;

interface CourierContract
{
    /**
     * @return array{awb_number: string, tracking_url: string, raw: array}
     */
    public function createShipment(Order $order, UserCourierSetting $setting): array;

    /**
     * @return array{status: string, raw: array}
     */
    public function trackShipment(string $awbNumber, UserCourierSetting $setting): array;
}
