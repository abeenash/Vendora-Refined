<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'flash' => function () {
                return [
                    'status' => session('status'),
                    'success' => session('success'),
                    'error' => session('error'),
                ];
            },

        ]);
        Inertia::share([
            'auth' => [
                'user' => fn() => Auth::user(),
            ]
        ]);

        Inertia::share('csrf_token', function () {
            return csrf_token();
        });

        Gate::define('viewAny', function (User $user) {
            return in_array($user->role, ['admin', 'salesperson']);
        });
    }
}
