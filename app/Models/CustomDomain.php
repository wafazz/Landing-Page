<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomDomain extends Model
{
    protected $fillable = [
        'user_id', 'domain', 'verification_token', 'is_verified', 'verified_at',
        'ssl_status', 'ssl_cert_path', 'ssl_expires_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'ssl_expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
