<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('subscription:check-expiry')->dailyAt('01:00');
Schedule::command('subscription:notify-expiring --days=3')->dailyAt('09:00');
