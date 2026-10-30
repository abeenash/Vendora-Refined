<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
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

        //public demo: the login page shows these accounts, the navbar shows a "demo" badge
        Inertia::share('demo', fn() => config('vendora.demo') ? [
            'password' => config('vendora.demo_password'),
            'accounts' => [
                ['label' => 'Admin (owner)', 'email' => 'admin@vendora.com'],
                ['label' => 'Salesperson', 'email' => 'sales@vendora.com'],
            ],
        ] : null);

        Gate::define('viewAny', function (User $user) {
            return in_array($user->role, ['admin', 'salesperson']);
        });

        //used by the POST /login route
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(strtolower((string) $request->input('email')) . '|' . $request->ip());
        });
    }
}
