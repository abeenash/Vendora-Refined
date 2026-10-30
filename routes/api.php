<?php

use App\Http\Controllers\Payments\ReceivableController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sales\SalesController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Dashboard\SalespersonDashboardController;

/*
| These are only called with axios from Vendora's own React pages, so they use the
| normal web session (cookie + CSRF), exactly like the Inertia pages. That works on
| any domain (localhost, 127.0.0.1:8123, the Render URL...) without Sanctum's
| stateful-domain list, which used to make these return 401 on unlisted hosts.
*/

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    //company-wide sales figures: admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/sales/weekly', [SalesController::class, 'getWeeklySales']);
        Route::get('/sales/monthly/{year}', [SalesController::class, 'getMonthlySales'])->whereNumber('year');
        Route::get('/sales/yearly', [SalesController::class, 'getYearlySales']);
        Route::get('/sales/custom', [SalesController::class, 'getCustomSales']);
        Route::get('/sales/available-years', [SalesController::class, 'availableYears']);
        Route::get('/sales/report', [SalesController::class, 'report']);
        Route::get('/sales/report/pdf/{period}/{year?}', [SalesController::class, 'exportSalesPdf']);

        //for dashboards
        Route::get('/sales/top-products', [SalesController::class, 'topProducts']);
        Route::get('/sales/revenue-category', [SalesController::class, 'revenueByCategory']);
        Route::get('/sales/compare-monthly', [SalesController::class, 'compareMonthly']);

        Route::post('/payments/{payment}/verify', [PaymentController::class, 'verify']);
    });

    //for salesperson dashboards
    Route::get('sales/my-weekly-sales', [SalespersonDashboardController::class, 'getMyWeeklySales']);
    Route::get('sales/my-top-products', [SalespersonDashboardController::class, 'getMyTopProducts']);

    //payments (API) - policies decide who may see / record them
    Route::get('/sales/{sale}/payments', [PaymentController::class, 'index']);
    Route::post('/sales/{sale}/payments', [PaymentController::class, 'store']);

    //Receivables reports (scoped to the salesperson's own sales inside the controller)
    Route::get('/reports/receivables/aging', [ReceivableController::class, 'aging']);
});
