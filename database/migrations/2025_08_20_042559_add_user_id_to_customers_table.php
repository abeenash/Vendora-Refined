<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            //salesperson assignment (nullable so a customer can exist without one)
            $table->foreignId('user_id')
                ->nullable() //make it nullable so that a customer can exist without one salesperson
                ->constrained('users') //this references the users table
                ->onUpdate('cascade') //if the salesperson is updated, the customer will be updated as well
                ->onDelete('set null'); //safer than cascade delete to avoid wiping customers if a salesperson is deleted
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
