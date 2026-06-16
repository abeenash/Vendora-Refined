<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'tax_id',
        'notes',
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function bills()
    {
        return $this->hasMany(SupplierBill::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }

    public function outstandingAmount()
    {
        return $this->bills()->whereIn('status', ['unpaid', 'partially_paid'])
            ->selectRaw('COALESCE(SUM(total_amount - paid_amount),0) as outstanding')
            ->value('outstanding') ?: 0;
    }
}
