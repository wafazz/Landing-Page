<?php

namespace App\Services\Notifications;

use App\Jobs\SendNotificationJob;
use App\Models\NotificationLog;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserNotificationPref;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\View;

class NotificationService
{
    public const EVENTS = [
        'order.placed' => 'Order Placed',
        'payment.received' => 'Payment Received',
        'shipment.created' => 'Shipment Created',
        'subscription.expiring' => 'Subscription Expiring',
    ];

    /**
     * @param array{name: string, email?: string|null, phone?: string|null} $recipient
     */
    public function dispatch(string $event, array $recipient, array $data, ?Model $notifiable = null, ?int $userId = null): void
    {
        if (! array_key_exists($event, self::EVENTS)) {
            throw new \InvalidArgumentException("Unknown event: {$event}");
        }

        $prefs = $userId ? $this->prefs($userId, $event) : ['email_enabled' => true, 'whatsapp_enabled' => true];

        if (! empty($recipient['email']) && $prefs['email_enabled'] && Setting::get('brevo_api_key')) {
            $this->queue('email', $event, $recipient, $data, $notifiable, $userId);
        }

        if (! empty($recipient['phone']) && $prefs['whatsapp_enabled'] && Setting::get('onsend_api_key')) {
            $this->queue('whatsapp', $event, $recipient, $data, $notifiable, $userId);
        }
    }

    public function deliver(NotificationLog $log): void
    {
        try {
            $payload = $log->payload ?? [];

            if ($log->channel === 'email') {
                $html = View::make("emails.{$log->event}", $payload)->render();
                app(BrevoMailer::class)->send($log->recipient, $payload['recipient_name'] ?? '', $log->subject ?? '', $html);
            } else {
                $message = $this->whatsappBody($log->event, $payload);
                app(OnsendWhatsApp::class)->send($log->recipient, $message);
            }

            $log->update(['status' => 'sent', 'sent_at' => now()]);
        } catch (\Throwable $e) {
            $log->update(['status' => 'failed', 'error' => $e->getMessage()]);
        }
    }

    private function queue(string $channel, string $event, array $recipient, array $data, ?Model $notifiable, ?int $userId): void
    {
        $log = NotificationLog::create([
            'user_id' => $userId,
            'event' => $event,
            'channel' => $channel,
            'recipient' => $channel === 'email' ? $recipient['email'] : $recipient['phone'],
            'subject' => $this->subjectFor($event, $data),
            'status' => 'queued',
            'payload' => array_merge($data, ['recipient_name' => $recipient['name']]),
            'notifiable_type' => $notifiable ? $notifiable::class : null,
            'notifiable_id' => $notifiable?->getKey(),
        ]);

        SendNotificationJob::dispatch($log->id);
    }

    private function prefs(int $userId, string $event): array
    {
        $pref = UserNotificationPref::firstOrCreate(
            ['user_id' => $userId, 'event' => $event],
            ['email_enabled' => true, 'whatsapp_enabled' => true]
        );

        return ['email_enabled' => $pref->email_enabled, 'whatsapp_enabled' => $pref->whatsapp_enabled];
    }

    private function subjectFor(string $event, array $data): string
    {
        $brand = Setting::get('site_name', 'LPage');
        return match ($event) {
            'order.placed' => "[{$brand}] Order received: " . ($data['order_number'] ?? ''),
            'payment.received' => "[{$brand}] Payment confirmed for " . ($data['order_number'] ?? ''),
            'shipment.created' => "[{$brand}] Your order has shipped — AWB " . ($data['awb_number'] ?? ''),
            'subscription.expiring' => "[{$brand}] Your subscription expires soon",
            default => $brand,
        };
    }

    private function whatsappBody(string $event, array $data): string
    {
        $brand = Setting::get('site_name', 'LPage');
        return match ($event) {
            'order.placed' => "Hi {$data['recipient_name']}! Your order *{$data['order_number']}* (RM {$data['total']}) has been received. We'll notify you once payment is confirmed.\n\n— {$brand}",
            'payment.received' => "Hi {$data['recipient_name']}! Payment for order *{$data['order_number']}* (RM {$data['total']}) is confirmed. Preparing shipment now.\n\n— {$brand}",
            'shipment.created' => "Hi {$data['recipient_name']}! Order *{$data['order_number']}* has shipped via {$data['courier']}. AWB: *{$data['awb_number']}*\nTrack: {$data['tracking_url']}\n\n— {$brand}",
            'subscription.expiring' => "Hi {$data['recipient_name']}! Your {$brand} subscription expires on {$data['ends_at']}. Renew anytime to keep your pages live.",
            default => "{$brand} notification",
        };
    }
}
