<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes};

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sale_id',
        'amount',
        'payment_method',
        'reference_number',
        'payment_date',
        'recorded_by',
        'verified_by',
        'notes',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
