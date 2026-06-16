<?php

namespace App\Http\Controllers\purchases;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->input('search');

        $suppliers = Supplier::query()
            ->when($q, fn($b) => $b->where('name', 'like', "%{$q}%")
                ->orWhere('email', 'like', "%{$q}%")
                ->orWhere('phone', 'like', "%{$q}%"))
            // eager load some useful aggregates
            ->withCount('purchaseOrders') // if relation exists
            ->withSum('bills', 'total_amount') // if bills relation exists
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('purchases/Supplier', [
            'suppliers' => $suppliers,
        ]);
    }

    public function store(SupplierRequest $request)
    {
        Supplier::create($request->validated());

        return redirect()->back()->with('success', 'Supplier created');
    }

    public function show(Supplier $supplier)
    {
        // Load summary data for the show page
        $supplier->load(['purchaseOrders' => fn($q) => $q->latest()->limit(5), 'bills' => fn($q) => $q->latest()->limit(5), 'payments' => fn($q) => $q->latest()->limit(10)]);

        $summary = [
            'total_purchase_orders' => $supplier->purchaseOrders()->count(),
            'total_billed' => $supplier->bills()->sum('total_amount'),
            'total_paid' => $supplier->bills()->sum('paid_amount'),
            'outstanding_balance' => $supplier->bills()->sum(DB::raw('total_amount - paid_amount')),
        ];

        return Inertia::render('purchases/SupplierShow', [
            'supplier' => $supplier,
            'summary' => $summary,
        ]);
    }

    public function update(SupplierRequest $request, Supplier $supplier)
    {
        $supplier->update($request->validated());

        return redirect()->back()->with('success', 'Supplier updated.');
    }

    public function destroy(Supplier $supplier)
    {
        // soft delete or real delete depending on your migration
        $supplier->delete();

        return redirect()->back()->with('success', 'Supplier deleted.');
    }
}
