<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sales\SalesController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/sales/weekly',[SalesController::class,'getWeeklySales']);
Route::get('/sales/monthly/{year}',[SalesController::class,'getMonthlySales']);
Route::get('/sales/yearly',[SalesController::class,'getYearlySales']);
Route::get('/sales/available-years',[SalesController::class,'availableYears']);
Route::get('/sales/report/pdf/{period}/{year?}',[SalesController::class,'exportSalesPdf']);

//for dashboards
Route::get('/sales/top-products',[SalesController::class,'topProducts']);