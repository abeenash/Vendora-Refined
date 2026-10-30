<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     *   php artisan migrate:fresh --seed     -> clean database with the demo business
     *   SEED_DEMO_DATA=false php artisan db:seed -> only the two login accounts
     */
    public function run(): void
    {
        $this->seedAccounts();

        if (filter_var(env('SEED_DEMO_DATA', true), FILTER_VALIDATE_BOOL)) {
            $this->call(DemoBusinessSeeder::class);
        }
    }

    //the two demo logins (fast: also used on its own by the demo reset, before the slow business data)
    public function seedAccounts(): void
    {
        // Admin = the business owner
        User::updateOrCreate(
            ['email' => 'admin@vendora.com'],
            [
                'name' => 'Suman Maharjan',
                'username' => 'admin',
                'phone' => '+9779800000000',
                'role' => 'admin',
                'password' => Hash::make('password'),
                'first_login' => false,
            ]
        );

        // Salesperson demo login (DemoBusinessSeeder fills in the rest of the team)
        User::updateOrCreate(
            ['email' => 'sales@vendora.com'],
            [
                'name' => 'Anish Shrestha',
                'username' => 'salesperson',
                'phone' => '+9779811111111',
                'role' => 'salesperson',
                'password' => Hash::make('password'),
                'first_login' => false,
            ]
        );
    }
}
