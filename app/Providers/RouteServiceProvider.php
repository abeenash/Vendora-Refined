<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Models\Customer;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //ids are numbers; otherwise Postgres throws "invalid input syntax for type bigint" (a 500) instead of a 404
        foreach (['product', 'category', 'sale', 'supplier', 'purchaseOrder', 'supplierBill', 'payment', 'manageuser', 'managecustomer'] as $param) {
            Route::pattern($param, '[0-9]+');
        }

        Route::bind('managecustomer', function ($value) {
            return Customer::withTrashed()->where('id', $value)->firstOrFail();
        });
    }
}
