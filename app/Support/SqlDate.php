<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Date expressions for GROUP BY / WHERE that work on MySQL, PostgreSQL and SQLite.
 * DATE_FORMAT() and YEAR() only exist in MySQL, which would tie hosting to MySQL
 * and break the SQLite test suite.
 */
class SqlDate
{
    //"2026-10"
    public static function yearMonth(string $column): string
    {
        return match (DB::getDriverName()) {
            'pgsql' => "to_char($column, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', $column)",
            default => "DATE_FORMAT($column, '%Y-%m')",
        };
    }

    //2026 (as an integer)
    public static function year(string $column): string
    {
        return match (DB::getDriverName()) {
            'pgsql' => "CAST(EXTRACT(YEAR FROM $column) AS INTEGER)",
            'sqlite' => "CAST(strftime('%Y', $column) AS INTEGER)",
            default => "YEAR($column)",
        };
    }
}
