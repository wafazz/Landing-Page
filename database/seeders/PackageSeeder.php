<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Trial',
                'slug' => 'trial',
                'description' => 'Free 15-day trial — limited features',
                'price' => 0,
                'tag' => 'trial',
                'max_landing_pages' => 1,
                'max_products' => 5,
                'can_use_tinymce' => true,
                'can_use_drag_drop' => false,
                'can_connect_courier' => false,
                'can_print_awb' => false,
                'can_use_custom_domain' => false,
                'sort_order' => 0,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'For solo sellers — TinyMCE + 3 pages',
                'price' => 29,
                'tag' => 'normal',
                'max_landing_pages' => 3,
                'max_products' => 20,
                'can_use_tinymce' => true,
                'can_use_drag_drop' => false,
                'can_connect_courier' => false,
                'can_print_awb' => false,
                'can_use_custom_domain' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'For growing brands — drag & drop + courier',
                'price' => 79,
                'tag' => 'normal',
                'max_landing_pages' => 10,
                'max_products' => 100,
                'can_use_tinymce' => true,
                'can_use_drag_drop' => true,
                'can_connect_courier' => true,
                'can_print_awb' => false,
                'can_use_custom_domain' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'For scale — unlimited + custom domain + AWB',
                'price' => 149,
                'tag' => 'normal',
                'max_landing_pages' => 999,
                'max_products' => null,
                'can_use_tinymce' => true,
                'can_use_drag_drop' => true,
                'can_connect_courier' => true,
                'can_print_awb' => true,
                'can_use_custom_domain' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($packages as $p) {
            Package::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
