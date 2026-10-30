<?php

use App\Http\Controllers\admin\StockMovementController;
use App\Http\Controllers\Payments\PayableController;
use App\Http\Controllers\Payments\ReceivableController;
use App\Http\Controllers\purchases\GrnController;
use App\Http\Controllers\purchases\PurchaseOrderController;
use App\Http\Controllers\purchases\SupplierBillController;
use App\Http\Controllers\purchases\SupplierController;
use App\Http\Controllers\purchases\SupplierPaymentController;
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



/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', fn() => Inertia::render('IndexPage'));

// Route::post('/predict', [PredictionController::class, 'predict'])->name('predict');


/*
|--------------------------------------------------------------------------
| Guest Routes (Login/Register)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'index'])->name('login');
    //5 attempts per minute per email+IP to slow down password guessing
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:login');
});


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

Route::post('/logout', [LogoutController::class, 'store'])->middleware('auth')->name('logout');



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


    /*
    |--------------------------------------------------------------------------
    | Force Password Reset Routes
    |--------------------------------------------------------------------------
    |
    | The force.password middleware lets these two through for users who
    | still have to set their password, and sends everyone else away.
    |
    */

    Route::get('/force-password-reset', [AuthController::class, 'forcePasswordReset'])
        ->name('force-password-reset');
    Route::post('/force-password-reset', [AuthController::class, 'updatePassword'])
        ->name('force-password-reset.update');


    /*
    |--------------------------------------------------------------------------
    | Profile & Settings
    |--------------------------------------------------------------------------
    */

    Route::get('/editprofile', [ProfileController::class, 'index'])->name('editprofile');
    Route::put('/editprofile', [ProfileController::class, 'update'])->name('editprofile.update');
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');



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
    | Categories (Admin)
    |--------------------------------------------------------------------------
    */

    Route::resource('categories', CategoryController::class)
        ->except(['show'])
        ->names('categories')
        ->middleware('role:admin');



    /*
    |--------------------------------------------------------------------------
    | Sales
    |--------------------------------------------------------------------------
    */

    Route::resource('sales', SalesController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy'])
        ->names('sales');

    Route::patch('/sales/{sale}/status', [SaleController::class, 'updateStatus'])
        ->name('sales.updateStatus');


    /*
    |--------------------------------------------------------------------------
    | Stock History
    |--------------------------------------------------------------------------
    */

    Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock.movements');


    /*
    |--------------------------------------------------------------------------
    | Purchases (Admin)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {
        //suppliers
        Route::resource('suppliers', SupplierController::class)
            ->only(['index', 'store', 'show', 'update', 'destroy'])
            ->names('suppliers');

        //purchase orders
        Route::get('purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::post('purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        Route::get('purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
        Route::patch('purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
        Route::post('purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
        Route::post('purchase-orders/{purchaseOrder}/close', [PurchaseOrderController::class, 'close'])->name('purchase-orders.close');

        // create GRN from PO (goods received)
        Route::post('purchase-orders/{purchaseOrder}/grn', [GrnController::class, 'store'])->name('purchase-orders.grn');

        //supplier bills and the payments made against them
        Route::get('supplier-bills', [SupplierBillController::class, 'index'])->name('supplier-bills.index');
        Route::post('supplier-bills', [SupplierBillController::class, 'store'])->name('supplier-bills.store');
        Route::post('supplier-bills/{supplierBill}/payments', [SupplierPaymentController::class, 'store'])
            ->name('supplier-bills.payments.store');

        Route::get('payables', [PayableController::class, 'index'])->name('payables.index');
    });

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Route::resource('managecustomers', ManageCustomerController::class)
        ->except(['show'])
        ->names('managecustomers')
        ->withTrashed();



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
        ->middleware('role:admin')
        ->name('salesreport');

    /*
   |--------------------------------------------------------------------------
   | Receivables (admin sees all, salesperson sees their own sales)
   |--------------------------------------------------------------------------
   */
    Route::get('receivables', [ReceivableController::class, 'index'])->name('receivables.index');
});
