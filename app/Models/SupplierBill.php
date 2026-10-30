<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierBill extends Model
{
    protected $fillable = [
        'bill_number',
        'supplier_id',
        'purchase_order_id',
        'bill_date',
        'due_date',
        'total_amount',
        'paid_amount',
        'status',
        'notes'
    ];

    protected function casts(): array
    {
        return [
            'bill_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
        ];
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }

    public function balanceDue(): float
    {
        return round((float) $this->total_amount - (float) $this->paid_amount, 2);
    }

    public function recalcPaid()
    {
        $paid = (float) $this->payments()->sum('amount');
        $this->paid_amount = $paid;
        $this->status = $paid >= (float) $this->total_amount ? 'paid' : ($paid > 0 ? 'partially_paid' : 'unpaid');
        $this->save();
    }
}
