<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            //a sale with payments can't be deleted
            $table->foreignId('sale_id')
                ->constrained('sales')
                ->restrictOnDelete();

            $table->decimal('amount', 10, 2);

            $table->enum('payment_method', [
                'cash',
                'bank_transfer',
                'cheque',
                'esewa',
                'connectips',
                'other'
            ]);

            $table->string('reference_number')->nullable();
            $table->date('payment_date');

            // who recorded it (salesperson or admin)
            $table->foreignId('recorded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // only admin sets this
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
