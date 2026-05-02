<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_payment_settings', function (Blueprint $table) {
            $table->text('credentials')->change();
        });
    }

    public function down(): void
    {
        Schema::table('user_payment_settings', function (Blueprint $table) {
            $table->json('credentials')->change();
        });
    }
};
