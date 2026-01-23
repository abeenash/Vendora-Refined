<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'po_number',
        'supplier_id',
        'created_by',
        'order_date',
        'quantity_received',
        'expected_delivery',
        'subtotal',
        'tax',
        'total',
        'status',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function recalcTotals()
    {
        $subtotal = $this->items()->sum(DB::raw('quantity_ordered * unit_price'));
        //we will need tax logic
        $this->subtotal = $subtotal;
        $this->total = $subtotal + $this->tax;
        $this->save();
    }
}
