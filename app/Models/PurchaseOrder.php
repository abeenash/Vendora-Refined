<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    //statuses in which goods can still be received against the PO
    public const RECEIVABLE_STATUSES = ['ordered', 'partially_received'];

    protected $fillable = [
        'po_number',
        'supplier_id',
        'created_by',
        'order_date',
        'expected_delivery',
        'subtotal',
        'tax',
        'total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date:Y-m-d',
            'expected_delivery' => 'date:Y-m-d',
        ];
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function grns()
    {
        return $this->hasMany(GRN::class, 'purchase_order_id');
    }

    public function bills()
    {
        return $this->hasMany(SupplierBill::class);
    }

    public function canReceive(): bool
    {
        return in_array($this->status, self::RECEIVABLE_STATUSES);
    }

    //recompute status from the received quantities of the lines
    public function refreshReceivingStatus(): void
    {
        $ordered = (int) $this->items()->sum('quantity_ordered');
        $received = (int) $this->items()->sum('quantity_received');

        $this->status = match (true) {
            $received === 0 => 'ordered',
            $received < $ordered => 'partially_received',
            default => 'received',
        };
        $this->save();
    }
}
