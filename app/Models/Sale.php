<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Customer;

class Sale extends Model
{
    protected $fillable = [
        'sale_number',
        'customer_id',
        'user_id',
        'total_price',
        'status'
    ];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function updatePaymentStatus()
    {
        $totalAmount = $this->total_amount; // your existing column
        $totalPaid = $this->payments()->sum('amount');

        $this->total_paid = $totalPaid;

        if ($totalPaid == 0) {
            $this->payment_status = 'unpaid';
        } elseif ($totalPaid < $totalAmount) {
            $this->payment_status = 'partially_paid';
        } else {
            $this->payment_status = 'paid';
        }

        // overdue logic
        if ($this->due_date && $this->payment_status !== 'paid') {
            if (now()->gt($this->due_date)) {
                $this->payment_status = 'overdue';
            }
        }

        $this->save();
    }

}
