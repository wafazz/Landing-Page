<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'user_id', 'name', 'slug', 'price', 'stock',
        'description', 'images', 'weight_kg', 'is_active',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function landingPages()
    {
        return $this->belongsToMany(LandingPage::class, 'landing_page_products')->withPivot('sort_order');
    }
}
