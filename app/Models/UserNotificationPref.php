<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotificationPref extends Model
{
    protected $fillable = ['user_id', 'event', 'email_enabled', 'whatsapp_enabled'];

    protected $casts = [
        'email_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
