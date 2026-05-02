<?php

namespace App\Services;

use App\Models\Package;
use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    public function startTrial(User $user): Subscription
    {
        $trial = Package::where('tag', 'trial')->where('is_active', true)->first();
        if (! $trial) {
            $trial = Package::firstOrCreate(
                ['slug' => 'trial'],
                [
                    'name' => 'Trial',
                    'description' => 'Free trial — limited features',
                    'price' => 0,
                    'tag' => 'trial',
                    'max_landing_pages' => 1,
                    'max_products' => 5,
                    'can_use_tinymce' => true,
                    'can_use_drag_drop' => false,
                    'can_connect_courier' => false,
                    'can_print_awb' => false,
                    'can_use_custom_domain' => false,
                ]
            );
        }

        $days = (int) Setting::get('trial_days', 15);
        $now = Carbon::now();

        return DB::transaction(function () use ($user, $trial, $now, $days) {
            Subscription::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'trial', 'active'])
                ->update(['status' => 'cancelled', 'cancelled_at' => $now]);

            return Subscription::create([
                'user_id'       => $user->id,
                'package_id'    => $trial->id,
                'status'        => 'trial',
                'amount'        => 0,
                'billing_cycle' => 'monthly',
                'starts_at'     => $now,
                'trial_ends_at' => $now->copy()->addDays($days),
                'ends_at'       => $now->copy()->addDays($days),
            ]);
        });
    }

    public function createPending(User $user, Package $package, string $gateway): Subscription
    {
        $now = Carbon::now();

        return DB::transaction(function () use ($user, $package, $gateway, $now) {
            Subscription::where('user_id', $user->id)
                ->where('status', 'pending')
                ->update(['status' => 'cancelled', 'cancelled_at' => $now]);

            return Subscription::create([
                'user_id'       => $user->id,
                'package_id'    => $package->id,
                'status'        => 'pending',
                'amount'        => $package->price,
                'billing_cycle' => $package->billing_cycle,
                'gateway'       => $gateway,
            ]);
        });
    }

    public function activate(Subscription $sub): Subscription
    {
        $now = Carbon::now();
        $cycle = $sub->billing_cycle === 'yearly' ? 12 : 1;

        return DB::transaction(function () use ($sub, $now, $cycle) {
            Subscription::where('user_id', $sub->user_id)
                ->where('id', '!=', $sub->id)
                ->whereIn('status', ['pending', 'trial', 'active'])
                ->update(['status' => 'cancelled', 'cancelled_at' => $now]);

            $sub->update([
                'status'    => 'active',
                'starts_at' => $now,
                'ends_at'   => $now->copy()->addMonths($cycle),
            ]);

            return $sub->fresh();
        });
    }

    public function expireOverdue(): int
    {
        $graceDays = (int) Setting::get('grace_period_days', 3);
        $cutoff = Carbon::now()->subDays($graceDays);

        return Subscription::whereIn('status', ['active', 'trial'])
            ->where('ends_at', '<', $cutoff)
            ->update(['status' => 'expired']);
    }
}
