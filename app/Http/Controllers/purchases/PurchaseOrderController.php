<?php

namespace App\Http\Controllers\purchases;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->input('search');

        $purchaseOrders = PurchaseOrder::with('supplier')
            ->when($q, fn($b) => $b->where('po_number', 'like', "%{$q}%")
                ->orWhereHas('supplier', fn($q2) => $q2->where('name', 'like', "%{$q}%")))
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('purchases/PurchaseOrder', [
            'purchaseOrders' => $purchaseOrders
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'order_date' => ['required', 'date'],
            'expected_delivery' => ['nullable', 'date'],
            'tax' => ['nullable', 'numeric'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity_ordered' => ['required', 'numeric|min:1'],
            'items.*.unit_price' => ['required', 'numeric|min:0'],
        ]);

        DB::transaction(function () use ($data, &$po) {
            //generate PO number format: PO-YYYY-XXXX
            $nextId = (PurchaseOrder::max('id') ?? 0) + 1;
            $poNumber = 'PO-' . now()->format('Y') . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

            $po = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $data['supplier_id'],
                'created_by' => Auth::user()->id,
                'order_date' => $data['order_date'],
                'expected_delivery' => $data['expected_delivery'] ?? null,
                'subtotal' => 0,
                'tax' => $data['tax'] ?? 0,
                'total' => 0,
                'status' => 'ordered',
            ]);

            $subtotal = 0;
            foreach ($data['items'] as $it) {
                $lineSubtotal = $it['quantity_ordered'] * $it['unit_price'];
                $po->items()->create([
                    'product_id' => $it['product_id'],
                    'quantity_ordered' => $it['quantity_ordered'],
                    'quantity_received' => 0,
                    'unit_price' => $it['unit_price'],
                    'tax' => $it['tax'] ?? 0,
                    'discount' => $it['discount'] ?? 0,
                    'subtotal' => $lineSubtotal,
                ]);
                $subtotal += $lineSubtotal;
            }

            $po->subtotal = $subtotal;
            $po->total = $subtotal + ($po->tax ?? 0);
            $po->save();
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order created.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'items.product']);
        return Inertia::render('purchases/PurchaseOrderShow', [
            'purchaseOrder' => $purchaseOrder
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        // Only allow updates when not closed/cancelled — adjust per your policy
        $data = $request->validate([
            'expected_delivery' => ['nullable', 'date'],
            'tax' => ['nullable', 'numeric'],
            'status' => ['nullable', Rule::in(['draft', 'ordered', 'partially_received', 'received', 'closed', 'cancelled'])],
            // items update omitted (you can add: items array patching)
        ]);

        $purchaseOrder->update($data);
        return redirect()->back()->with('success', 'PO updated.');
    }

    public function cancel(PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['closed', 'cancelled'])) {
            $purchaseOrder->status = 'cancelled';
            $purchaseOrder->save();
        }
        return redirect()->back()->with('success', 'PO cancelled.');
    }

    public function close(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->status = 'closed';
        $purchaseOrder->save();
        return redirect()->back()->with('success', 'PO closed.');
    }

}
