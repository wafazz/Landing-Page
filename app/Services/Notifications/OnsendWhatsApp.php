<?php

namespace App\Services\Notifications;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class OnsendWhatsApp
{
    public function send(string $toPhone, string $message): array
    {
        $apiKey = Setting::get('onsend_api_key');
        $instanceId = Setting::get('onsend_instance_id');

        if (! $apiKey || ! $instanceId) {
            throw new \RuntimeException('Onsend credentials not configured');
        }

        $phone = preg_replace('/[^0-9]/', '', $toPhone);
        if (! str_starts_with($phone, '60')) {
            $phone = '60' . ltrim($phone, '0');
        }

        $resp = Http::asJson()
            ->acceptJson()
            ->post('https://app.onsend.io/api/send-message', [
                'instance_id' => $instanceId,
                'access_token' => $apiKey,
                'phone' => $phone,
                'message' => $message,
                'type' => 'text',
            ]);

        if (! $resp->successful()) {
            throw new \RuntimeException('Onsend send failed: ' . $resp->body());
        }

        return $resp->json();
    }
}
