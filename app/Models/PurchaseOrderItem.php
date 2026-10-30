<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity_ordered',
        'quantity_received',
        'unit_price',
        'tax',
        'total_price',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function remaining(): int
    {
        return max(0, $this->quantity_ordered - $this->quantity_received);
    }
}
