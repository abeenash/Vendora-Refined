<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Payment, Sale};
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Sale $sale)
    {
        $this->authorize('view', $sale);
        return response()->json(['data' => $sale->payments()->with(['recorder', 'verifier'])->latest()->get()]);
    }

    public function store(Request $request, Sale $sale)
    {
        $this->authorize('createPayment', $sale);

        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($data, $sale) {
            $payment = Payment::create(array_merge($data, [
                'sale_id' => $sale->id,
                'recorded_by' => auth()->id(),
            ]));

            // Recalculate the sale totals atomically
            $sale->recalculatePayments(); // implement this in model
        });

        return response()->json(['message' => 'Payment recorded.'], 201);
    }

    public function verify(Payment $payment)
    {
        $this->authorize('verify', $payment);
        $payment->update(['verified_by' => auth()->id()]);
        return response()->json(['message' => 'Payment verified.']);
    }
}
