<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Payment::class);

        $data = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create([
            ...$data,
            'recorded_by' => auth()->id(),
        ]);

        // update status on sale
        $payment->sale->updatePaymentStatus();

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function verify(Payment $payment)
    {
        $this->authorize('verify', $payment);

        $payment->update([
            'verified_by' => auth()->id()
        ]);

        return back()->with('success', 'Payment verified.');
    }

    public function index()
    {
        $this->authorize('viewAny', Payment::class);

        $user = auth()->user();

        if ($user->role === 'admin') {
            $payments = Payment::with(['sale', 'recorder', 'verifier'])
                ->latest()
                ->get();
        } else {
            $payments = Payment::whereHas('sale', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->with(['sale', 'recorder'])
                ->latest()
                ->get();
        }

        return Inertia::render('Payments/Index', [
            'payments' => $payments
        ]);
    }

}
