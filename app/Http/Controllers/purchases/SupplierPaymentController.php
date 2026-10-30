<?php

namespace App\Http\Controllers\purchases;

use App\Http\Controllers\Controller;
use App\Models\{SupplierBill, SupplierPayment};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SupplierPaymentController extends Controller
{
    //pay (part of) a supplier bill
    public function store(Request $request, SupplierBill $supplierBill)
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', Rule::in(SupplierPayment::METHODS)],
            'reference' => ['nullable', 'string', 'max:100'],
            'paid_at' => ['required', 'date', 'before_or_equal:today'],
        ]);

        DB::transaction(function () use ($data, $supplierBill) {
            $bill = SupplierBill::lockForUpdate()->findOrFail($supplierBill->id);

            $balance = $bill->balanceDue();
            if ((float) $data['amount'] > $balance) {
                throw ValidationException::withMessages([
                    'amount' => $balance > 0
                        ? "Amount exceeds the balance due (NPR " . number_format($balance, 2) . ")."
                        : 'This bill is already fully paid.',
                ]);
            }

            $bill->payments()->create($data + [
                'supplier_id' => $bill->supplier_id,
                'recorded_by' => Auth::id(),
            ]);

            $bill->recalcPaid();
        });

        return redirect()->back()->with('success', "Payment recorded for bill {$supplierBill->bill_number}.");
    }
}
