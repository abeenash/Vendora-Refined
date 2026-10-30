<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;

class StockService
{
    public function record(Product $product, $old, $new, $type, $description = null)
    {
        StockMovement::create([
            'product_id' => $product->id,
            'user_id' => Auth::id(),
            'old_stock' => $old,
            'new_stock' => $new,
            'type' => $type,
            'description' => $description,
        ]);
    }

    /**
     * Change a product's stock by $delta (negative = remove) and log it.
     * Must be called inside a DB transaction; the row is locked so two
     * requests can't both read the same old stock.
     */
    public function adjust(int $productId, int $delta, string $type, string $description): Product
    {
        $product = Product::withTrashed()->lockForUpdate()->findOrFail($productId);

        $old = $product->stock;
        $product->stock = $old + $delta;
        $product->save();

        $this->record($product, $old, $product->stock, $type, $description);

        return $product;
    }

    //put every item of a sale back on the shelf (used when a sale is cancelled or deleted)
    public function restoreSale(Sale $sale, string $type, string $description): void
    {
        foreach ($sale->items as $item) {
            $this->adjust($item->product_id, $item->quantity, $type, $description);
        }
    }
}
