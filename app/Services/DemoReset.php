<?php

namespace App\Services;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Rebuilds the demo business so its six months of history end today.
 *
 * Business tables are emptied and DemoBusinessSeeder replays the simulation anchored on
 * now(), so "today's sales", "last 7 days" and the aging buckets always look alive.
 * The demo logins are kept (same ids), so visitors who are signed in stay signed in.
 * Everything runs in one transaction: visitors see the old data until the new data is ready.
 */
class DemoReset
{
    //children first, so it also works where TRUNCATE doesn't cascade
    private const TABLES = [
        'supplier_payments', 'supplier_bills', 'grn_items', 'grns', 'purchase_order_items', 'purchase_orders',
        'payments', 'sale_items', 'sales', 'stock_movements', 'customers', 'products', 'categories', 'suppliers',
    ];

    private const STAMP = 'vendora:demo-refreshed-on';

    public static function refreshedOn(): ?string
    {
        return Cache::get(self::STAMP);
    }

    //"today" in the app's timezone (Asia/Kathmandu), so the reset happens after local midnight
    public static function isStale(): bool
    {
        return self::refreshedOn() !== now()->toDateString();
    }

    public function run(): void
    {
        //two schedulers/containers must never rebuild at the same time
        Cache::lock('vendora:demo-reset', 600)->block(5, function () {
            DB::transaction(function () {
                Schema::withoutForeignKeyConstraints(function () {
                    foreach (self::TABLES as $table) {
                        DB::table($table)->truncate();
                    }
                });

                //accounts visitors created (e.g. new salespeople) go; the demo logins are reset below
                User::whereNotIn('email', config('vendora.demo_accounts'))->delete();

                app(DatabaseSeeder::class)->setContainer(app())->run();
            });

            Cache::forever(self::STAMP, now()->toDateString());
        });
    }
}
