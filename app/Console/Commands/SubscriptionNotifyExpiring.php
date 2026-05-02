<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\Notifications\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SubscriptionNotifyExpiring extends Command
{
    protected $signature = 'subscription:notify-expiring {--days=3}';
    protected $description = 'Notify subscribers whose subscription expires within N days';

    public function handle(NotificationService $service): int
    {
        $days = (int) $this->option('days');
        $now = Carbon::now();
        $window = $now->copy()->addDays($days);

        $subs = Subscription::with('user', 'package')
            ->whereIn('status', ['active', 'trial'])
            ->whereBetween('ends_at', [$now, $window])
            ->get();

        $sent = 0;
        foreach ($subs as $sub) {
            if (! $sub->user) continue;
            $service->dispatch(
                'subscription.expiring',
                ['name' => $sub->user->name, 'email' => $sub->user->email, 'phone' => $sub->user->phone ?? null],
                [
                    'package_name' => $sub->package?->name ?? '—',
                    'ends_at' => Carbon::parse($sub->ends_at)->format('Y-m-d'),
                    'days_left' => max(0, $now->diffInDays(Carbon::parse($sub->ends_at), false)),
                    'renew_url' => url('/subscription'),
                ],
                $sub,
                $sub->user_id,
            );
            $sent++;
        }

        $this->info("Queued {$sent} expiring-subscription notification(s).");
        return self::SUCCESS;
    }
}
