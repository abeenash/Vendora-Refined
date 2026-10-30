<?php

namespace App\Http\Controllers\purchases;

use App\Http\Controllers\Controller;
use App\Models\{GRN, PurchaseOrder};
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\ValidationException;

class GrnController extends Controller
{
    public function store(Request $request, PurchaseOrder $purchaseOrder, StockService $stock)
    {
        if (!$purchaseOrder->canReceive()) {
            throw ValidationException::withMessages(['items' => "Goods can't be received on a {$purchaseOrder->status} PO."]);
        }

        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|distinct|integer',
            'items.*.qty_received' => 'required|integer|min:0',
            'received_date' => 'nullable|date|before_or_equal:today',
            'notes' => 'nullable|string|max:1000',
        ]);

        $lines = collect($data['items'])->filter(fn($it) => $it['qty_received'] > 0);
        if ($lines->isEmpty()) {
            throw ValidationException::withMessages(['items' => 'Enter a received quantity for at least one item.']);
        }

        DB::transaction(function () use ($data, $lines, $purchaseOrder, $stock) {
            $grn = GRN::create([
                'purchase_order_id' => $purchaseOrder->id,
                'received_by' => Auth::id(),
                'received_at' => $data['received_date'] ?? now(),
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($lines as $it) {
                //only lines that belong to THIS purchase order, locked while we update them
                $poi = $purchaseOrder->items()->lockForUpdate()->find($it['id']);
                if (!$poi) {
                    throw ValidationException::withMessages(['items' => 'One of the items does not belong to this purchase order.']);
                }

                //reject instead of silently clamping, so the GRN matches what was physically counted
                if ($it['qty_received'] > $poi->remaining()) {
                    throw ValidationException::withMessages([
                        'items' => "Only {$poi->remaining()} more of {$poi->product->name} can be received on this PO.",
                    ]);
                }

                $poi->quantity_received += $it['qty_received'];
                $poi->save();

                $grn->items()->create([
                    'purchase_order_item_id' => $poi->id,
                    'product_id' => $poi->product_id,
                    'qty_received' => $it['qty_received'],
                ]);

                //goods are now on the shelf
                $stock->adjust($poi->product_id, $it['qty_received'], 'restock', "Received on {$purchaseOrder->po_number} (GRN #{$grn->id})");
            }

            $purchaseOrder->refreshReceivingStatus();
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder)->with('success', 'GRN recorded and stock updated.');
    }
}
