<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    protected $fillable = [
        'user_id', 'landing_page_id', 'visitor_id',
        'ip', 'user_agent', 'referrer', 'country', 'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function landingPage()
    {
        return $this->belongsTo(LandingPage::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
