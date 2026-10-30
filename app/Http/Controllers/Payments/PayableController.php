<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Models\SupplierPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayableController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $t = $today->toDateString();

        //bills we still owe money on
        $base = DB::table('supplier_bills')
            ->join('suppliers', 'supplier_bills.supplier_id', '=', 'suppliers.id')
            ->whereIn('supplier_bills.status', ['unpaid', 'partially_paid', 'overdue']);

        $rows = (clone $base)
            ->when($request->search, function ($q, $search) {
                $q->where(fn($w) => $w->whereLike('supplier_bills.bill_number', "%{$search}%")
                    ->orWhereLike('suppliers.name', "%{$search}%"));
            })
            ->select([
                'supplier_bills.id',
                'supplier_bills.bill_number',
                'suppliers.name as supplier',
                'supplier_bills.total_amount',
                'supplier_bills.paid_amount',
                DB::raw('(supplier_bills.total_amount - supplier_bills.paid_amount) as balance_due'),
                'supplier_bills.due_date',
                DB::raw("CASE WHEN supplier_bills.due_date < '{$t}' THEN 'overdue' ELSE supplier_bills.status END as status"),
            ])
            ->orderBy('supplier_bills.due_date')
            ->paginate(10)
            ->withQueryString();

        $balance = '(supplier_bills.total_amount - supplier_bills.paid_amount)';
        $summary = (clone $base)
            ->selectRaw("
                COALESCE(SUM($balance),0) as total_outstanding,
                COALESCE(SUM(CASE WHEN supplier_bills.due_date < ? THEN $balance ELSE 0 END),0) as overdue_amount,
                COALESCE(SUM(CASE WHEN supplier_bills.status = 'partially_paid' THEN 1 ELSE 0 END),0) as partially_paid_count,
                COUNT(*) as outstanding_bills,
                COALESCE(SUM(CASE WHEN supplier_bills.due_date >= ? OR supplier_bills.due_date IS NULL THEN $balance ELSE 0 END),0) as aging_current,
                COALESCE(SUM(CASE WHEN supplier_bills.due_date < ? AND supplier_bills.due_date >= ? THEN $balance ELSE 0 END),0) as aging_1_30,
                COALESCE(SUM(CASE WHEN supplier_bills.due_date < ? AND supplier_bills.due_date >= ? THEN $balance ELSE 0 END),0) as aging_31_60,
                COALESCE(SUM(CASE WHEN supplier_bills.due_date < ? THEN $balance ELSE 0 END),0) as aging_61_plus
            ", [
                $t,
                $t,
                $t, $today->copy()->subDays(30)->toDateString(),
                $today->copy()->subDays(30)->toDateString(), $today->copy()->subDays(60)->toDateString(),
                $today->copy()->subDays(60)->toDateString(),
            ])
            ->first();

        return Inertia::render("payment/Payable", [
            'rows' => $rows,
            'summary' => $summary,
            'search' => $request->search,
            'paymentMethods' => SupplierPayment::METHODS,
        ]);
    }
}
