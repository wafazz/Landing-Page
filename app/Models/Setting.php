<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting.$key", 60, function () use ($key, $default) {
            $row = static::where('key', $key)->first();
            return $row?->value ?? $default;
        });
    }

    public static function set(string $key, $value, string $type = 'string'): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value, 'type' => $type]);
        Cache::forget("setting.$key");
    }

    public static function flush(): void
    {
        foreach (static::all() as $row) {
            Cache::forget("setting.{$row->key}");
        }
    }
}
