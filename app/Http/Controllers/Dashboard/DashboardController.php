<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {

        //to get total products
        $totalProducts = Product::count();

        //to get product counts grouped by category
        $categoryData = Category::withCount('products')
            ->get()
            ->map(function ($category) use ($totalProducts) {
                $percentage = $totalProducts > 0 ? round(($category->products_count / $totalProducts) * 100) : 0;
                return [
                    'category' => $category->name,
                    'stock' => $category->products_count,
                    'percentage' => $percentage,
                ];
            });

        //let's get the sales data
        $totalSales = Sale::sum('total_price');
        $todaySales = Sale::whereDate('created_at', today())->sum('total_price');

        return Inertia::render('dashboard/Dashboard', [
            'products' => Product::paginate(10),
            'categoryData' => $categoryData,
            'userCount' => User::count(),
            'sales' => [
                'total_price' => $totalSales,
                'today_sales' => $todaySales,
            ]
        ]);
    }
}
