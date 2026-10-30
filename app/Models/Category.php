<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
    ];

    //active products only (archived ones are excluded by Product's SoftDeletes)
    public function products(){
        return $this->hasMany(Product::class);
    }
}
