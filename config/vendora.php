<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public demo mode
    |--------------------------------------------------------------------------
    |
    | DEMO_MODE=true turns the deployment into a public demo:
    |   - the login page shows the demo accounts
    |   - the demo accounts' password / email can't be changed and they can't be deleted
    |     (otherwise one visitor could lock everybody else out)
    |   - the demo business is rebuilt once a day (see `php artisan demo:refresh`), so
    |     its six months of history always end "today" and visitors' edits are undone
    |
    */

    'demo' => (bool) env('DEMO_MODE', false),

    //the logins created by Database\Seeders\DatabaseSeeder / DemoBusinessSeeder
    'demo_accounts' => [
        'admin@vendora.com',
        'sales@vendora.com',
        'pooja@vendora.com',
        'ramesh@vendora.com',
        'sunita@vendora.com',
    ],

    'demo_password' => 'password',
];
