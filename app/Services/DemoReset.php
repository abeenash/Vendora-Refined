<?php

namespace App\Services;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoBusinessSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Rebuilds the demo business so its six months of history end today.
 *
 * Business tables are emptied and DemoBusinessSeeder replays the simulation anchored on
 * now(), so "today's sales", "last 7 days" and the aging buckets always look alive.
 *
 * Two steps:
 *   1. the demo logins, in their own quick transaction, so visitors can sign in within
 *      seconds, even on a brand-new database while step 2 is still running
 *   2. the business data, in one transaction: visitors see the old data until the new
 *      data is complete (the seed is ~3,500 queries, so its speed depends on how close
 *      the database is to the app)
 * The logins keep their ids, so visitors who are signed in stay signed in.
 */
class DemoReset
{
    //children first, so it also works where TRUNCATE doesn't cascade
    private const TABLES = [
        'supplier_payments', 'supplier_bills', 'grn_items', 'grns', 'purchase_order_items', 'purchase_orders',
        'payments', 'sale_items', 'sales', 'stock_movements', 'customers', 'products', 'categories', 'suppliers',
    ];

    private const STAMP = 'vendora:demo-refreshed-on';

    //longer than the slowest realistic seed, so a second reset can never start alongside a running one
    private const LOCK_SECONDS = 1800;

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
        Cache::lock('vendora:demo-reset', self::LOCK_SECONDS)->block(5, function () {
            //1. logins first, committed on their own
            DB::transaction(function () {
                app(DatabaseSeeder::class)->setContainer(app())->seedAccounts();
            });

            //2. the business, rebuilt in one go
            DB::transaction(function () {
                Schema::withoutForeignKeyConstraints(function () {
                    foreach (self::TABLES as $table) {
                        DB::table($table)->truncate();
                    }
                });

                //accounts visitors created (e.g. new salespeople) go; the rest of the demo team is recreated below
                User::whereNotIn('email', config('vendora.demo_accounts'))->delete();

                app(DemoBusinessSeeder::class)->setContainer(app())->run();
            });

            Cache::forever(self::STAMP, now()->toDateString());
        });
    }
}
