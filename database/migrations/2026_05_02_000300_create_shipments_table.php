<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('courier', ['ninjavan', 'jnt']);
            $table->string('awb_number')->nullable()->index();
            $table->string('tracking_url')->nullable();
            $table->enum('status', ['pending', 'created', 'picked_up', 'in_transit', 'delivered', 'failed'])->default('pending');
            $table->string('label_path')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->unique('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
