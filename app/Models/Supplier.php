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

    //a supplier with purchasing history can't be deleted (the FKs restrict it)
    public function hasHistory(): bool
    {
        return $this->purchaseOrders()->exists() || $this->bills()->exists() || $this->payments()->exists();
    }

    public function outstandingAmount()
    {
        return $this->bills()->whereIn('status', ['unpaid', 'partially_paid'])
            ->selectRaw('COALESCE(SUM(total_amount - paid_amount),0) as outstanding')
            ->value('outstanding') ?: 0;
    }
}
