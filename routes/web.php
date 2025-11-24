<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

// Auth
use App\Http\Controllers\auth\{
    LoginController,
    LogoutController,
    RegisterController
};
use App\Http\Controllers\AuthController;

// Dashboard
use App\Http\Controllers\Dashboard\DashboardController;

// Admin-only
use App\Http\Controllers\admin\{
    CategoryController,
    ManageUsersController,
    ProductController as AdminProductController
};

// Products (accessible based on role)
use App\Http\Controllers\Products\ProductController;

// Sales
use App\Http\Controllers\Sales\{
    SalesController,
    SaleController,
    SalesReportController
};

// Customers
use App\Http\Controllers\Customer\ManageCustomerController;

// Profile and Settings
use App\Http\Controllers\Profile\{
    ProfileController,
    SettingsController
};

// Misc
use App\Http\Controllers\PredictionController;



/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', fn () => Inertia::render('IndexPage'));

Route::post('/predict', [PredictionController::class, 'predict'])->name('predict');


/*
|--------------------------------------------------------------------------
| Guest Routes (Login/Register)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login',  [LoginController::class, 'index'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

Route::post('/logout', [LogoutController::class, 'store'])->name('logout');



/*
|--------------------------------------------------------------------------
| Authenticated Routes (With Force Password Reset Check)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'force.password'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');


    /*
    |--------------------------------------------------------------------------
    | Force Password Reset Routes
    |--------------------------------------------------------------------------
    |
    | These MUST be available to users who haven't verified OR set passwords.
    |
    */

    Route::get('/force-password-reset', [AuthController::class, 'forcePasswordReset'])
        ->name('force-password-reset');

    Route::post('/force-password-reset', [AuthController::class, 'updatePassword']);



    /*
    |--------------------------------------------------------------------------
    | Profile & Settings
    |--------------------------------------------------------------------------
    */

    Route::get('/editprofile', [ProfileController::class, 'index'])->name('editprofile');
    Route::get('/settings',     [SettingsController::class, 'index'])->name('settings');



    /*
    |--------------------------------------------------------------------------
    | Product Routes
    |--------------------------------------------------------------------------
    */

    // Everyone can view list
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');

    // Admin-exclusive product management
    Route::middleware('role:admin')->group(function () {
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products',        [ProductController::class, 'store'])->name('products.store');

        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}',      [ProductController::class, 'update'])->name('products.update');

        Route::delete('/products/{product}',   [ProductController::class, 'destroy'])->name('products.destroy');
    });



    /*
    |--------------------------------------------------------------------------
    | Categories (Admin)
    |--------------------------------------------------------------------------
    */

    Route::resource('categories', CategoryController::class)->names('categories');



    /*
    |--------------------------------------------------------------------------
    | Sales
    |--------------------------------------------------------------------------
    */

    Route::resource('sales', SalesController::class)->names('sales');

    Route::patch('/sales/{sale}/status', [SaleController::class, 'updateStatus'])
        ->name('sales.updateStatus');



    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Route::resource('managecustomers', ManageCustomerController::class)
        ->names('managecustomers');



    /*
    |--------------------------------------------------------------------------
    | User Management (Admin Only)
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {
        Route::get('/manageusers',              [ManageUsersController::class, 'index'])->name('manageusers.index');
        Route::get('/manageusers/create',       [ManageUsersController::class, 'create'])->name('manageusers.create');
        Route::post('/manageusers',             [ManageUsersController::class, 'store'])->name('manageusers.store');

        Route::get('/manageusers/{manageuser}/edit', [ManageUsersController::class, 'edit'])->name('manageusers.edit');
        Route::put('/manageusers/{manageuser}',      [ManageUsersController::class, 'update'])->name('manageusers.update');

        Route::delete('/manageusers/{manageuser}',   [ManageUsersController::class, 'destroy'])->name('manageusers.destroy');
    });



    /*
    |--------------------------------------------------------------------------
    | Sales Reports
    |--------------------------------------------------------------------------
    */

    Route::get('/salesreport', [SalesReportController::class, 'index'])
        ->name('salesreport');
});
