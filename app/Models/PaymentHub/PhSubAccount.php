<?php

namespace App\Models\PaymentHub;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PhSubAccount extends Model
{
    protected $guarded = ['id'];

    public function saasApplication(): BelongsTo
    {
        return $this->belongsTo(SaasApplication::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PhTransaction::class);
    }
}
