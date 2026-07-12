<?php

namespace App\Models\PaymentHub;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhTransaction extends Model
{
    protected $guarded = ['id'];
    
    protected $casts = [
        'paid_at' => 'datetime',
        'forwarded_to_webhook' => 'boolean',
    ];

    public function saasApplication(): BelongsTo
    {
        return $this->belongsTo(SaasApplication::class);
    }

    public function subAccount(): BelongsTo
    {
        return $this->belongsTo(PhSubAccount::class, 'ph_sub_account_id');
    }
}
