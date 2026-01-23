<?php

namespace App\Http\Controllers\purchases;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GrnController extends Controller
{
    public function store(Request $request, PurchaseOrder $purchaseOrder)
    {
        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:purchase_order_items,id',
            'items.*.qty_received' => 'required|numeric|min:0',
            'received_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($data, $purchaseOrder) {
            foreach ($data['items'] as $it) {
                $poi = $purchaseOrder->items()->where('id', $it['id'])->first();
                if (!$poi)
                    continue;
                $poi->quantity_received += $it['qty_received'];
                if ($poi->quantity_received > $poi->quantity_ordered) {
                    $poi->quantity_received = $poi->quantity_ordered; // clamp if you want
                }
                $poi->save();

                // optional: create GRN record table for audit (recommended)
            }

            // compute status
            $totalOrdered = $purchaseOrder->items()->sum('quantity_ordered');
            $totalReceived = $purchaseOrder->items()->sum('quantity_received');

            if ($totalReceived == 0) {
                $purchaseOrder->status = 'ordered';
            } elseif ($totalReceived < $totalOrdered) {
                $purchaseOrder->status = 'partially_received';
            } else {
                $purchaseOrder->status = 'received';
            }

            $purchaseOrder->save();
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder)->with('success', 'GRN recorded.');
    }
}
