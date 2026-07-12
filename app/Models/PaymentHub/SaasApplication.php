<?php

namespace App\Models\PaymentHub;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SaasApplication extends Model
{
    protected $guarded = ['id'];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->api_key)) {
                $model->api_key = 'sk_test_' . Str::random(40);
            }
        });
    }

    public function subAccounts(): HasMany
    {
        return $this->hasMany(PhSubAccount::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PhTransaction::class);
    }
}
