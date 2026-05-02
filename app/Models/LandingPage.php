<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPage extends Model
{
    protected $fillable = [
        'user_id', 'title', 'slug', 'editor_mode',
        'content_html', 'grapesjs_data', 'checkout_mode',
        'seo_title', 'seo_description', 'og_image',
        'is_published', 'is_homepage', 'views_count', 'published_at',
    ];

    protected $casts = [
        'grapesjs_data' => 'array',
        'is_published' => 'boolean',
        'is_homepage' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'landing_page_products')->withPivot('sort_order');
    }
}
