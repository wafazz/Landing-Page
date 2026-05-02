<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly');
            $table->enum('tag', ['normal', 'promo', 'trial'])->default('normal');

            $table->integer('max_landing_pages')->default(1);
            $table->integer('max_products')->nullable();
            $table->boolean('can_use_tinymce')->default(true);
            $table->boolean('can_use_drag_drop')->default(false);
            $table->boolean('can_connect_courier')->default(false);
            $table->boolean('can_print_awb')->default(false);
            $table->boolean('can_use_custom_domain')->default(false);

            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
