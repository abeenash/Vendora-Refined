<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@vendora.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'phone' => '+9779800000000',
                'role' => 'admin',
                'password' => Hash::make('password'),
                'first_login' => false,
            ]
        );

        // Create Salesperson User
        User::updateOrCreate(
            ['email' => 'sales@vendora.com'],
            [
                'name' => 'Sales Person',
                'username' => 'salesperson',
                'phone' => '+9779811111111',
                'role' => 'salesperson',
                'password' => Hash::make('password'),
                'first_login' => false,
            ]
        );
    }
}
