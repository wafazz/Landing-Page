<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id', 'package_id', 'status', 'amount', 'billing_cycle',
        'starts_at', 'ends_at', 'trial_ends_at', 'cancelled_at',
        'gateway', 'gateway_ref',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function payments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trial'])
            && $this->ends_at?->isFuture();
    }

    public function isTrial(): bool
    {
        return $this->status === 'trial' && $this->trial_ends_at?->isFuture();
    }

    public function isInGracePeriod(): bool
    {
        if (! $this->ends_at) return false;
        $graceDays = (int) Setting::get('grace_period_days', 3);
        return $this->ends_at->isPast() && $this->ends_at->copy()->addDays($graceDays)->isFuture();
    }

    public function daysLeft(): int
    {
        if (! $this->ends_at) return 0;
        $now = Carbon::now();
        if ($this->ends_at->isPast()) return 0;
        return (int) $now->diffInDays($this->ends_at, false);
    }
}
