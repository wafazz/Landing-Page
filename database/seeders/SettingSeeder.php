<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['site_name', 'LPage.my', 'string'],
            ['trial_days', '15', 'integer'],
            ['grace_period_days', '3', 'integer'],
            ['site_logo', null, 'string'],

            ['billplz_api_key', null, 'string'],
            ['billplz_collection_id', null, 'string'],
            ['billplz_x_signature', null, 'string'],
            ['billplz_sandbox', '1', 'boolean'],

            ['brevo_api_key', null, 'string'],

            ['onsend_api_key', null, 'string'],
            ['onsend_instance_id', null, 'string'],
        ];

        foreach ($defaults as [$key, $value, $type]) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value, 'type' => $type]);
        }
    }
}
