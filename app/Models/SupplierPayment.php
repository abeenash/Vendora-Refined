<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierPayment extends Model
{
    public const METHODS = ['cash', 'bank_transfer', 'cheque', 'other'];

    protected $fillable = [
        'supplier_bill_id',
        'supplier_id',
        'amount',
        'method',
        'reference',
        'paid_at',
        'recorded_by'
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'date:Y-m-d',
        ];
    }

    public function supplierBill()
    {
        return $this->belongsTo(SupplierBill::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
