<?php

use App\Http\Controllers\admin\StockMovementController;
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
};
use App\Http\Controllers\AuthController;

// Dashboard
use App\Http\Controllers\Dashboard\DashboardController;

// Admin-only
use App\Http\Controllers\admin\{
    CategoryController,
    ManageUsersController,
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
use App\Http\Controllers\{PredictionController, PaymentController};



/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', fn() => Inertia::render('IndexPage'));

Route::post('/predict', [PredictionController::class, 'predict'])->name('predict');


/*
|--------------------------------------------------------------------------
| Guest Routes (Login/Register)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'index'])->name('login');
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

    //Admin's dashboard
    Route::middleware('role:admin')
        ->get('/dashboard/admin', [DashboardController::class, 'admin'])
        ->name('dashboard.admin');

    //Salesperson's dashboard
    Route::middleware('role:salesperson')
        ->get('/dashboard/salesperson', [DashboardController::class, 'salesperson'])
        ->name('dashboard.salesperson');
    // Route::get('/dashboard',[DashboardController::class,'index'])->name('dashboard');


    /*
    |--------------------------------------------------------------------------
    | Profile & Settings
    |--------------------------------------------------------------------------
    */

    Route::get('/editprofile', [ProfileController::class, 'index'])->name('editprofile');
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');



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
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');

        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');

        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Force Password Reset Routes
    |--------------------------------------------------------------------------
    |
    | These MUST be available to users who haven't verified OR set passwords.
    |
    */

    // Force password reset must NOT be blocked by force.password middleware
    Route::middleware(['auth'])->group(function () {
        Route::get('/force-password-reset', [AuthController::class, 'forcePasswordReset'])
            ->name('force-password-reset');

        Route::post('/force-password-reset', [AuthController::class, 'updatePassword']);
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
    | Stock History
    |--------------------------------------------------------------------------
    */

    Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock.movements')->middleware(['auth']);


    /*
    |--------------------------------------------------------------------------
    | Payment
    |--------------------------------------------------------------------------
    */

    Route::middleware(['auth'])->group(function () {
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::post('/payments/{payment}/verify', [PaymentController::class, 'verify'])
            ->name('payments.verify');
    });

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
        Route::get('/manageusers', [ManageUsersController::class, 'index'])->name('manageusers.index');
        Route::get('/manageusers/create', [ManageUsersController::class, 'create'])->name('manageusers.create');
        Route::post('/manageusers', [ManageUsersController::class, 'store'])->name('manageusers.store');

        Route::get('/manageusers/{manageuser}/edit', [ManageUsersController::class, 'edit'])->name('manageusers.edit');
        Route::put('/manageusers/{manageuser}', [ManageUsersController::class, 'update'])->name('manageusers.update');

        Route::delete('/manageusers/{manageuser}', [ManageUsersController::class, 'destroy'])->name('manageusers.destroy');
    });



    /*
    |--------------------------------------------------------------------------
    | Sales Reports
    |--------------------------------------------------------------------------
    */

    Route::get('/salesreport', [SalesReportController::class, 'index'])
        ->name('salesreport');
});


