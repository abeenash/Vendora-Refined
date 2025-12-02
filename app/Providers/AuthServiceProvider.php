<?php

namespace App\Providers;

use App\Models\{Sale, Product, Customer};
use App\Policies\{SalePolicy, ProductPolicy, CustomerPolicy};
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
//we did not use use Illuminate\Support\ServiceProvider; because this is wrong for RBAC + policies. Laravel's actual AuthServiceProvider has special policy-loading behavior;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Sale::class => SalePolicy::class,
        Customer::class => CustomerPolicy::class,
        Payment::class => PaymentPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        //
    }
}
