<?php

use App\Http\Controllers\admin\{DashboardController, ProductController, SalesController, CategoryController, ManageCustomerController,ManageSalespersonController
    ,ManageUsersController
    ,ProfileController
    ,SaleController
    ,SalesReportController
    ,SettingsController};

use App\Http\Controllers\auth\{LoginController, LogoutController, RegisterController};
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render("IndexPage");
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'index'])->name("register");
    Route::post('/register', [RegisterController::class, 'store']);

    Route::get('/login', [LoginController::class, 'index'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

Route::post('/logout', [LogoutController::class, 'store'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['verified'])->group(function () {

        //For PRODUCTS------------
        // Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        // Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        // Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        // Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        // Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        // Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        //NOW LOOK HOW INSANELY just by managing 'resource' helper we can do all the above tasks
        Route::resource('products', ProductController::class)->names('products');

        //For CATEGORY------------
        Route::resource('categories', CategoryController::class)->names('categories');

        //For SALES-------------
        Route::resource('sales', SalesController::class)->names('sales');

        //For CUSTOMERS-------------
        Route::resource('managecustomers', ManageCustomerController::class)->names('managecustomers');
        Route::patch('/sales/{sale}/status',[SaleController::class,'updateStatus'])->name('sales.updateStatus');
    });
    
    Route::get('/editprofile', [ProfileController::class, 'index'])->name('editprofile');
    
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');

    // Route::get('/categories', [CategoryController::class, 'index'])->name('categories');

    Route::get('/sale', [SaleController::class, 'index'])->name('sale');

    Route::get('/salesreport', [SalesReportController::class, 'index'])->name("salesreport");

    Route::get('/manageusers', [ManageUsersController::class, 'index'])->name('manageusers');

    Route::get('/managesalesperson', [ManageSalespersonController::class, 'index'])->name('managesalesperson');


});
