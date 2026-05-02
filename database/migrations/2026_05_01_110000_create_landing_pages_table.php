<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->enum('editor_mode', ['tinymce', 'grapesjs'])->default('tinymce');
            $table->longText('content_html')->nullable();
            $table->json('grapesjs_data')->nullable();
            $table->enum('checkout_mode', ['single', 'cart'])->default('cart');

            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('og_image')->nullable();

            $table->boolean('is_published')->default(false);
            $table->boolean('is_homepage')->default(false);
            $table->unsignedInteger('views_count')->default(0);

            $table->timestamp('published_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->unique(['user_id', 'slug']);
            $table->index(['user_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_pages');
    }
};
