<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierPayment extends Model
{
    protected $fillable = [
        'supplier_bill_id',
        'supplier_id',
        'amount',
        'method',
        'reference',
        'paid_at',
        'recorded_by'
    ];

    public function supplierBill()
    {
        return $this->belongsTo(SupplierBill::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
