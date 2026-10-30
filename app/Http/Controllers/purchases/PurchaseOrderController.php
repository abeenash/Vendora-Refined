<?php

namespace App\Http\Controllers\purchases;

use App\Http\Controllers\Controller;
use App\Models\{Product, PurchaseOrder, Supplier};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->input('search');

        $purchaseOrders = PurchaseOrder::with('supplier')
            ->withCount('items')
            ->when($q, fn($b) => $b->where(fn($w) => $w->whereLike('po_number', "%{$q}%")
                ->orWhereHas('supplier', fn($q2) => $q2->whereLike('name', "%{$q}%"))))
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('purchases/PurchaseOrder', [
            'purchaseOrders' => $purchaseOrders,
            'search' => $q,
            //for the "Create PO" form
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku', 'stock']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'order_date' => ['required', 'date'],
            'expected_delivery' => ['nullable', 'date', 'after_or_equal:order_date'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'distinct', 'exists:products,id,deleted_at,NULL'],
            'items.*.quantity_ordered' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ], [
            'items.*.product_id.distinct' => 'Each product can only appear once on a PO.',
        ]);

        $po = DB::transaction(function () use ($data) {
            $po = PurchaseOrder::create([
                'po_number' => 'PO-PENDING-' . uniqid(),
                'supplier_id' => $data['supplier_id'],
                'created_by' => Auth::id(),
                'order_date' => $data['order_date'],
                'expected_delivery' => $data['expected_delivery'] ?? null,
                'subtotal' => 0,
                'tax' => $data['tax'] ?? 0,
                'total' => 0,
                'status' => 'ordered',
            ]);

            //generate PO number format: PO-YYYY-XXXX, based on the id so it is always unique
            $po->po_number = 'PO-' . now()->format('Y') . '-' . str_pad($po->id, 4, '0', STR_PAD_LEFT);

            $subtotal = 0;
            foreach ($data['items'] as $it) {
                $lineTotal = $it['quantity_ordered'] * $it['unit_price'];
                $po->items()->create([
                    'product_id' => $it['product_id'],
                    'quantity_ordered' => $it['quantity_ordered'],
                    'quantity_received' => 0,
                    'unit_price' => $it['unit_price'],
                    'total_price' => $lineTotal,
                ]);
                $subtotal += $lineTotal;
            }

            $po->subtotal = $subtotal;
            $po->total = $subtotal + $po->tax;
            $po->save();

            return $po;
        });

        return redirect()->route('purchase-orders.show', $po)->with('success', "Purchase Order {$po->po_number} created.");
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load([
            'supplier',
            'creator:id,name',
            'items.product:id,name,sku',
            'grns' => fn($q) => $q->latest(),
            'grns.receiver:id,name',
            'grns.items.product:id,name',
            'bills',
        ]);

        return Inertia::render('purchases/PurchaseOrderShow', [
            'purchaseOrder' => $purchaseOrder,
            'canReceive' => $purchaseOrder->canReceive(),
            //bills can only be raised for goods that actually arrived
            'receivedValue' => $purchaseOrder->items->sum(fn($i) => $i->quantity_received * $i->unit_price),
            'billedValue' => (float) $purchaseOrder->bills->sum('total_amount'),
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        //status changes go through cancel / close / GRN so stock and status can't get out of sync
        if (in_array($purchaseOrder->status, ['closed', 'cancelled'])) {
            return redirect()->back()->with('error', 'A closed or cancelled PO cannot be edited.');
        }

        $data = $request->validate([
            'expected_delivery' => ['nullable', 'date', 'after_or_equal:' . $purchaseOrder->order_date->toDateString()],
            'tax' => ['nullable', 'numeric', 'min:0'],
        ]);

        $purchaseOrder->fill($data);
        $purchaseOrder->total = $purchaseOrder->subtotal + $purchaseOrder->tax;
        $purchaseOrder->save();

        return redirect()->back()->with('success', 'PO updated.');
    }

    public function cancel(PurchaseOrder $purchaseOrder)
    {
        //once goods have arrived they are in stock; cancelling would leave stock and PO disagreeing
        if (!in_array($purchaseOrder->status, ['draft', 'ordered'])) {
            return redirect()->back()->with('error', 'Only a PO with nothing received yet can be cancelled. Close it instead.');
        }

        $purchaseOrder->update(['status' => 'cancelled']);
        return redirect()->back()->with('success', 'PO cancelled.');
    }

    public function close(PurchaseOrder $purchaseOrder)
    {
        //closing = "we won't receive the rest", so something must have been received
        if (!in_array($purchaseOrder->status, ['partially_received', 'received'])) {
            return redirect()->back()->with('error', 'Only a PO that has received goods can be closed. Cancel it instead.');
        }

        $purchaseOrder->update(['status' => 'closed']);
        return redirect()->back()->with('success', 'PO closed.');
    }

}
