<?php

namespace App\Http\Controllers\purchases;

use App\Http\Controllers\Controller;
use App\Models\{PurchaseOrder, Supplier, SupplierBill, SupplierPayment};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SupplierBillController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->input('search');

        $bills = SupplierBill::with(['supplier:id,name', 'purchaseOrder:id,po_number'])
            ->when($q, fn($b) => $b->where(fn($w) => $w->whereLike('bill_number', "%{$q}%")
                ->orWhereHas('supplier', fn($s) => $s->whereLike('name', "%{$q}%"))))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("purchases/SupplierBill", [
            'bills' => $bills,
            'search' => $q,
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'paymentMethods' => SupplierPayment::METHODS,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'bill_number' => ['required', 'string', 'max:100', 'unique:supplier_bills,bill_number'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'purchase_order_id' => [
                'nullable',
                //the PO must belong to the same supplier
                Rule::exists('purchase_orders', 'id')->where('supplier_id', $request->input('supplier_id')),
            ],
            'bill_date' => ['required', 'date', 'before_or_equal:today'],
            'due_date' => ['nullable', 'date', 'after_or_equal:bill_date'],
            'total_amount' => ['required', 'numeric', 'min:0.01', 'max:999999999999.99'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ], [
            'purchase_order_id.exists' => 'That purchase order does not belong to this supplier.',
        ]);

        DB::transaction(function () use ($data) {
            if (!empty($data['purchase_order_id'])) {
                $po = PurchaseOrder::with('items')->lockForUpdate()->findOrFail($data['purchase_order_id']);

                //can't be billed for more than what has actually been received
                $received = $po->items->sum(fn($i) => $i->quantity_received * $i->unit_price);
                $receivedWithTax = $received + ($po->subtotal > 0 ? $po->tax * ($received / $po->subtotal) : 0);
                $alreadyBilled = (float) $po->bills()->sum('total_amount');
                $billable = round($receivedWithTax - $alreadyBilled, 2);

                if ((float) $data['total_amount'] > $billable) {
                    throw ValidationException::withMessages([
                        'total_amount' => "Only NPR " . number_format(max(0, $billable), 2) . " of received goods on {$po->po_number} is left to bill.",
                    ]);
                }
            }

            SupplierBill::create($data + ['paid_amount' => 0, 'status' => 'unpaid']);
        });

        return redirect()->back()->with('success', "Bill {$data['bill_number']} recorded.");
    }
}
