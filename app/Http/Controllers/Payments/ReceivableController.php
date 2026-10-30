<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReceivableController extends Controller
{
    public function index()
    {
        //get today's date first
        $today = Carbon::today();

        //base query for outstanding invoices (excluding the fully paid)
        $base = DB::table('sales')
            ->join('customers', 'sales.customer_id', '=', 'customers.id')
            ->whereIn('sales.payment_status', ['unpaid', 'partially_paid', 'overdue']);

        //list to render the table rows with pagination
        $rows = (clone $base)
            ->select([
                'sales.id',
                'sales.sale_number',
                'customers.name as customer',
                'sales.total_price',
                'sales.total_paid',
                DB::raw('(sales.total_price - sales.total_paid) as balance_due'),
                'sales.due_date',
                'sales.payment_status',
            ])
            ->orderBy('sales.due_date')
            ->paginate(10)
            ->withQueryString();

        //summary aggregates
        $summary = (clone $base)
            ->selectRaw("
                COALESCE(SUM(sales.total_price - sales.total_paid),0) as total_outstanding,
                COALESCE(SUM(CASE WHEN sales.due_date < ? THEN (sales.total_price - sales.total_paid) ELSE 0 END),0) as overdue_amount,
                COALESCE(SUM(CASE WHEN sales.payment_status = 'partially_paid' THEN 1 ELSE 0 END),0) as partially_paid_count,
                COALESCE(COUNT(*),0) as outstanding_invoices
                ", [$today])
            ->first();

        return Inertia::render("payment/Receivable", [
            'rows' => $rows,
            'summary' => $summary,
        ]);
    }

    public function aging()
    {
        $today = Carbon::today();

        $aging = DB::table('sales')
            ->whereIn('payment_status', ['unpaid', 'partially_paid', 'overdue'])
            ->selectRaw("
            SUM(CASE 
                WHEN due_date >= ?
                THEN (total_price - total_paid) ELSE 0 END) AS current,

            SUM(CASE 
                WHEN due_date < ? AND due_date >= ?
                THEN (total_price - total_paid) ELSE 0 END) AS days_1_30,

            SUM(CASE 
                WHEN due_date < ? AND due_date >= ?
                THEN (total_price - total_paid) ELSE 0 END) AS days_31_60,

            SUM(CASE 
                WHEN due_date < ?
                THEN (total_price - total_paid) ELSE 0 END) AS days_61_plus
        ", [
                $today,
                $today,
                $today->copy()->subDays(30),
                $today->copy()->subDays(30),
                $today->copy()->subDays(60),
                $today->copy()->subDays(60),
            ])
            ->first();

        return response()->json(['data' => $aging]);
    }
}
