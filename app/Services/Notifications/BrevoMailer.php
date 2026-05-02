<?php

namespace App\Services\Notifications;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class BrevoMailer
{
    public function send(string $toEmail, string $toName, string $subject, string $html): array
    {
        $apiKey = Setting::get('brevo_api_key');
        $siteName = Setting::get('site_name', 'LPage.my');
        $fromEmail = Setting::get('site_email', 'noreply@lpage.my');

        if (! $apiKey) {
            throw new \RuntimeException('Brevo API key not configured');
        }

        $resp = Http::withHeaders(['api-key' => $apiKey])
            ->acceptJson()
            ->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => ['name' => $siteName, 'email' => $fromEmail],
                'to' => [['email' => $toEmail, 'name' => $toName]],
                'subject' => $subject,
                'htmlContent' => $html,
            ]);

        if (! $resp->successful()) {
            throw new \RuntimeException('Brevo send failed: ' . $resp->body());
        }

        return $resp->json();
    }
}
