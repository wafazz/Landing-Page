<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $fillable = [
        'order_id', 'user_id', 'courier', 'awb_number', 'tracking_url',
        'status', 'label_path', 'raw_response', 'shipped_at', 'delivered_at',
    ];

    protected $casts = [
        'raw_response' => 'array',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
