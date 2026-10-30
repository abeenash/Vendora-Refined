<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Sale;

class SaleController extends Controller
{
    public function updateStatus(Request $request, Sale $sale, StockService $stock){
        $this->authorize('updateStatus', $sale);

        $request->validate([
            'status'=>'required|in:Pending,Completed,Cancelled',
        ]);

        $newStatus = $request->status;

        //cancelling gives the stock back, so un-cancelling would need it taken again; the UI already says it is final
        if ($sale->status === 'Cancelled') {
            throw ValidationException::withMessages(['status' => 'A cancelled sale cannot be changed.']);
        }

        if ($newStatus === 'Cancelled' && $sale->payments()->exists()) {
            throw ValidationException::withMessages(['status' => 'This sale has payments recorded, so it cannot be cancelled.']);
        }

        DB::transaction(function () use ($sale, $newStatus, $stock) {
            if ($newStatus === 'Cancelled') {
                $stock->restoreSale($sale, 'cancel', "Stock returned because Sale {$sale->sale_number} was cancelled");
            }

            $sale->update([
                'status'=>$newStatus,
            ]);
        });

        return back();
    }
}
