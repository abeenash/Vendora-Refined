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
        'status',
        'payment_status',
        'total_paid',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
        ];
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class)->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function balanceDue(): float
    {
        return round((float) $this->total_price - (float) $this->total_paid, 2);
    }

    public function recalculatePayments()
    {
        $totalPaid = (float) $this->payments()->sum('amount');
        $this->total_paid = $totalPaid;

        if ($totalPaid <= 0) {
            $this->payment_status = 'unpaid';
        } elseif ($totalPaid >= (float) $this->total_price) {
            $this->payment_status = 'paid';
        } else {
            $this->payment_status = 'partially_paid';
        }

        $this->save();
        return $this;
    }

}
