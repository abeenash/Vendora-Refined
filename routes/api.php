<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sales\SalesController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Dashboard\SalespersonDashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/sales/weekly', [SalesController::class, 'getWeeklySales']);
Route::get('/sales/monthly/{year}', [SalesController::class, 'getMonthlySales']);
Route::get('/sales/yearly', [SalesController::class, 'getYearlySales']);
Route::get('/sales/custom', [SalesController::class, 'getCustomSales']);
Route::get('/sales/available-years', [SalesController::class, 'availableYears']);
Route::get('/sales/report/pdf/{period}/{year?}', [SalesController::class, 'exportSalesPdf']);

//for dashboards
Route::get('/sales/top-products', [SalesController::class, 'topProducts']);
Route::get('/sales/revenue-category', [SalesController::class, 'revenueByCategory']);
Route::get('/sales/compare-monthly', [SalesController::class, 'compareMonthly']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/payments/sale/{sale}', [PaymentController::class, 'paymentsBySale']);
});

//for salesperson dashboards
// Route::get('sales/my-stats', [SalespersonDashboardController::class, 'myStats']);
Route::get('sales/my-weekly-sales', [SalespersonDashboardController::class, 'getMyWeeklySales']);
// Route::get('sales/top-products', [SalespersonDashboardController::class, 'topProducts']);
// Route::get('stock-movements', [SalespersonDashboardController::class, 'stockMovements']);
