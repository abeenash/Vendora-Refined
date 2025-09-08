<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'sku',
        'category_id',
        'price',
        'stock',
        'min_stock'
    ];

    public function sales(){
        return $this->hasMany(Sale::class);
    }

    public function category(){
        return $this->belongsTo(Category::class);
    }
}
