<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GRN extends Model
{
    //the class name "GRN" would otherwise make Laravel look for a table called "g_r_n_s"
    protected $table = 'grns';

    protected $fillable = [
        'purchase_order_id',
        'received_by',
        'received_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
        ];
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function items()
    {
        return $this->hasMany(GrnItem::class, 'grn_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
