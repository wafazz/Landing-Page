<?php

namespace App\Services\Gateways;

use App\Models\Order;
use App\Models\UserPaymentSetting;

class SenangPayGateway
{
    public function createBill(Order $order, UserPaymentSetting $setting): array
    {
        $creds = $setting->credentials->toArray();
        $merchantId = $creds['merchant_id'] ?? '';
        $secret = $creds['secret_key'] ?? '';

        $base = $setting->is_sandbox
            ? 'https://sandbox.senangpay.my/payment'
            : 'https://app.senangpay.my/payment';

        $detail = "Order #{$order->order_number}";
        $amount = number_format((float) $order->total, 2, '.', '');
        $orderId = $order->order_number;

        $hash = hash_hmac('sha256', $secret . $detail . $amount . $orderId, $secret);

        $url = "{$base}/{$merchantId}?" . http_build_query([
            'detail' => $detail,
            'amount' => $amount,
            'order_id' => $orderId,
            'hash' => $hash,
            'name' => $order->customer_name,
            'email' => $order->customer_email,
            'phone' => $order->customer_phone ?? '',
        ]);

        return [
            'reference' => null,
            'redirect' => $url,
        ];
    }

    public function verifyCallback(array $payload, UserPaymentSetting $setting): bool
    {
        $creds = $setting->credentials->toArray();
        $secret = $creds['secret_key'] ?? '';

        $statusId = $payload['status_id'] ?? '';
        $orderId = $payload['order_id'] ?? '';
        $transactionId = $payload['transaction_id'] ?? '';
        $msg = $payload['msg'] ?? '';
        $hash = $payload['hash'] ?? '';

        $expected = hash_hmac('sha256', $secret . $statusId . $orderId . $transactionId . $msg, $secret);

        return hash_equals($expected, $hash);
    }

    public function isPaid(array $payload): bool
    {
        return ($payload['status_id'] ?? '') === '1';
    }
}
