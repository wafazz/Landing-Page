<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class SubscriptionCheckExpiry extends Command
{
    protected $signature = 'subscription:check-expiry';
    protected $description = 'Mark expired subscriptions past grace period';

    public function handle(SubscriptionService $service): int
    {
        $count = $service->expireOverdue();
        $this->info("Marked {$count} subscription(s) as expired.");
        return self::SUCCESS;
    }
}
