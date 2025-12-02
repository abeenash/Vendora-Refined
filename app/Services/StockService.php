<?php

namespace App\Services;

use App\Models\Product;
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
}
