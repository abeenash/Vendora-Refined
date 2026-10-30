<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReceivableController extends Controller
{
    //outstanding invoices: not cancelled, not fully paid. A salesperson only sees their own.
    private function outstanding()
    {
        $user = Auth::user();

        return DB::table('sales')
            ->where('sales.status', '!=', 'Cancelled')
            ->whereIn('sales.payment_status', ['unpaid', 'partially_paid', 'overdue'])
            ->when($user->role !== 'admin', fn($q) => $q->where('sales.user_id', $user->id));
    }

    public function index(Request $request)
    {
        //get today's date first
        $today = Carbon::today()->toDateString();

        //left join so walk-in sales (no customer) still show up
        $base = $this->outstanding()
            ->leftJoin('customers', 'sales.customer_id', '=', 'customers.id');

        //list to render the table rows with pagination
        $rows = (clone $base)
            ->when($request->search, function ($q, $search) {
                $q->where(fn($w) => $w->whereLike('sales.sale_number', "%{$search}%")
                    ->orWhereLike('customers.name', "%{$search}%"));
            })
            ->select([
                'sales.id',
                'sales.sale_number',
                DB::raw("COALESCE(customers.name, 'Walk-in Customer') as customer"),
                'sales.total_price',
                'sales.total_paid',
                DB::raw('(sales.total_price - sales.total_paid) as balance_due'),
                'sales.due_date',
                DB::raw("CASE WHEN sales.due_date < '{$today}' THEN 'overdue' ELSE sales.payment_status END as payment_status"),
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
                COUNT(*) as outstanding_invoices
                ", [$today])
            ->first();

        return Inertia::render("payment/Receivable", [
            'rows' => $rows,
            'summary' => $summary,
            'search' => $request->search,
            'paymentMethods' => Payment::METHODS,
        ]);
    }

    public function aging()
    {
        $today = Carbon::today();

        $aging = $this->outstanding()
            ->selectRaw("
            COALESCE(SUM(CASE
                WHEN due_date >= ? OR due_date IS NULL
                THEN (total_price - total_paid) ELSE 0 END),0) AS current_amount,

            COALESCE(SUM(CASE
                WHEN due_date < ? AND due_date >= ?
                THEN (total_price - total_paid) ELSE 0 END),0) AS days_1_30,

            COALESCE(SUM(CASE
                WHEN due_date < ? AND due_date >= ?
                THEN (total_price - total_paid) ELSE 0 END),0) AS days_31_60,

            COALESCE(SUM(CASE
                WHEN due_date < ?
                THEN (total_price - total_paid) ELSE 0 END),0) AS days_61_plus
        ", [
                $today->toDateString(),
                $today->toDateString(),
                $today->copy()->subDays(30)->toDateString(),
                $today->copy()->subDays(30)->toDateString(),
                $today->copy()->subDays(60)->toDateString(),
                $today->copy()->subDays(60)->toDateString(),
            ])
            ->first();

        //"current" is a reserved word in some databases, so it is aliased in SQL and renamed here
        //databases return SUM() of decimals as strings, the chart cards want numbers
        return response()->json(['data' => [
            'current' => (float) $aging->current_amount,
            'days_1_30' => (float) $aging->days_1_30,
            'days_31_60' => (float) $aging->days_31_60,
            'days_61_plus' => (float) $aging->days_61_plus,
        ]]);
    }
}
