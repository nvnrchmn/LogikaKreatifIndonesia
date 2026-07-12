<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTask extends Model
{
    protected $fillable = [
        'order_id',
        'title',
        'description',
        'status',
        'position',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
