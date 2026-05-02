<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'billing_cycle', 'tag',
        'max_landing_pages', 'max_products',
        'can_use_tinymce', 'can_use_drag_drop',
        'can_connect_courier', 'can_print_awb', 'can_use_custom_domain',
        'sort_order', 'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'can_use_tinymce' => 'boolean',
        'can_use_drag_drop' => 'boolean',
        'can_connect_courier' => 'boolean',
        'can_print_awb' => 'boolean',
        'can_use_custom_domain' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function isTrial(): bool
    {
        return $this->tag === 'trial';
    }

    public function isPromo(): bool
    {
        return $this->tag === 'promo';
    }
}
