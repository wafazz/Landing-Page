<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsEncryptedArrayObject;
use Illuminate\Database\Eloquent\Model;

class UserPaymentSetting extends Model
{
    protected $fillable = ['user_id', 'gateway', 'credentials', 'is_sandbox', 'is_default', 'is_active'];

    protected $casts = [
        'credentials' => AsEncryptedArrayObject::class,
        'is_sandbox' => 'boolean',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
