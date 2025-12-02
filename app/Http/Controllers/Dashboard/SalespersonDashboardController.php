<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SalespersonDashboardController extends Controller
{
    // 1. BASIC STATS
    // public function myStats()
    // {
    //     $userId = Auth::id();

    //     return response()->json([
    //         'today_total' => DB::table('sales')
    //             ->where('user_id', $userId)
    //             ->whereDate('created_at', today())
    //             ->sum('total_price'),

    //         'month_total' => DB::table('sales')
    //             ->where('user_id', $userId)
    //             ->whereMonth('created_at', now()->month)
    //             ->sum('total_price'),

    //         'total_sales_count' => DB::table('sales')
    //             ->where('user_id', $userId)
    //             ->count(),

    //         'customer_count' => DB::table('customers')
    //             ->where('user_id', $userId)
    //             ->count(),
    //     ]);
    // }

    // 2. WEEKLY SALES (LAST 7 DAYS)
    private function fetchMyWeeklySales()
    {
        $userId = Auth::id();

        return DB::table('sales')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price) as total')
            )
            ->where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subDays(6))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    // 3. TOP PRODUCTS SOLD BY SALES PERSON
    // public function myTopProducts()
    // {
    //     $userId = Auth::id();

    //     $data = DB::table('sale_items')
    //         ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
    //         ->join('products', 'sale_items.product_id', '=', 'products.id')
    //         ->where('sales.user_id', $userId)
    //         ->where('sales.created_at', '>=', now()->subDays(30))
    //         ->select(
    //             'products.name as product_name',
    //             DB::raw('SUM(sale_items.quantity) as total_qty')
    //         )
    //         ->groupBy('products.name')
    //         ->orderByDesc('total_qty')
    //         ->limit(5)
    //         ->get();

    //     return response()->json($data);
    // }

    public function getMyWeeklySales()
    {
        return response()->json($this->fetchMyWeeklySales());
    }
}
