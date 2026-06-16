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

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }

    public function recalcPaid()
    {
        $paid = $this->payments()->sum('amount');
        $this->paid_amount = $paid;
        $this->status = $paid >= $this->total_amount ? 'paid' : ($paid > 0 ? 'partially_paid' : 'unpaid');
        $this->save();
    }
}
