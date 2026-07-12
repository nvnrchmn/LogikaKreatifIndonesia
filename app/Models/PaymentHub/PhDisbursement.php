<?php

namespace App\Models\PaymentHub;

use Illuminate\Database\Eloquent\Model;

class PhDisbursement extends Model
{
    protected $guarded = ['id'];

    public function saasApplication()
    {
        return $this->belongsTo(SaasApplication::class);
    }

    public function subAccount()
    {
        return $this->belongsTo(PhSubAccount::class, 'ph_sub_account_id');
    }
}
