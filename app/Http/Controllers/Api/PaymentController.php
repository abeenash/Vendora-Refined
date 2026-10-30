<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use App\Models\{Payment, Sale};
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Sale $sale)
    {
        $this->authorize('view', $sale);
        return response()->json(['data' => $sale->payments()->with(['recorder:id,name', 'verifier:id,name'])->latest()->get()]);
    }

    public function store(Request $request, Sale $sale)
    {
        $this->authorize('createPayment', $sale);

        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:99999999.99',
            'payment_method' => ['required', Rule::in(Payment::METHODS)],
            'reference_number' => 'nullable|string|max:100',
            'payment_date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string|max:1000',
        ]);

        $payment = DB::transaction(function () use ($data, $sale) {
            //lock the sale so two payments recorded at the same moment can't both pass the balance check
            $sale = Sale::lockForUpdate()->findOrFail($sale->id);

            $balance = $sale->balanceDue();
            if ((float) $data['amount'] > $balance) {
                throw ValidationException::withMessages([
                    'amount' => $balance > 0
                        ? "Amount exceeds the balance due (NPR " . number_format($balance, 2) . ")."
                        : 'This invoice is already fully paid.',
                ]);
            }

            $payment = Payment::create(array_merge($data, [
                'sale_id' => $sale->id,
                'recorded_by' => auth()->id(),
            ]));

            // Recalculate the sale totals atomically
            $sale->recalculatePayments();

            return $payment;
        });

        return response()->json(['message' => 'Payment recorded.', 'data' => $payment], 201);
    }

    public function verify(Payment $payment)
    {
        $this->authorize('verify', $payment);

        if ($payment->verified_by === null) {
            $payment->update(['verified_by' => auth()->id()]);
        }

        return response()->json(['message' => 'Payment verified.']);
    }
}
