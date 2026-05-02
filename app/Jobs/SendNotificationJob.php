<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Services\Notifications\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public int $logId) {}

    public function handle(NotificationService $service): void
    {
        $log = NotificationLog::find($this->logId);
        if (! $log || $log->status === 'sent') {
            return;
        }

        $service->deliver($log);
    }
}
