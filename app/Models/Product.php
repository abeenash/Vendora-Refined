<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    //deleting a product archives it, so past sales and POs keep pointing at a real row
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'sku',
        'category_id',
        'price',
        'stock',
        'min_stock'
    ];

    public function saleItems(){
        return $this->hasMany(SaleItem::class);
    }

    //an archived category still names the products (and invoices) that belonged to it
    public function category(){
        return $this->belongsTo(Category::class)->withTrashed();
    }

    public function stockMovements(){
        return $this->hasMany(StockMovement::class);
    }

    public function purchaseOrderItems(){
        return $this->hasMany(PurchaseOrderItem::class);
    }

    //sold or ordered at least once: deleting it must keep the row (archive) for the books
    public function hasHistory(): bool
    {
        return $this->saleItems()->exists() || $this->purchaseOrderItems()->exists();
    }
}
