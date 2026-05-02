<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('stock')->nullable();
            $table->text('description')->nullable();
            $table->json('images')->nullable();
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->unique(['user_id', 'slug']);
        });

        Schema::create('landing_page_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landing_page_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('sort_order')->default(0);

            $table->unique(['landing_page_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_page_products');
        Schema::dropIfExists('products');
    }
};
