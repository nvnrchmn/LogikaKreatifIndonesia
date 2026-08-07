<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'company_name',
        'pic_name',
        'email',
        'phone',
        'address',
        'city',
        'notes',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->company_name ?: $this->pic_name;
    }
}
