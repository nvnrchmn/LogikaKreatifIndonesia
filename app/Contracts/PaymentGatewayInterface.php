<?php

namespace App\Contracts;

use App\Models\Transaction;
use App\Models\User;

interface PaymentGatewayInterface
{
    /**
     * Generate a payment payload or URL for the transaction.
     *
     * @param Transaction $transaction
     * @param User $customer
     * @return array|string
     */
    public function generatePaymentToken(Transaction $transaction, User $customer);
}
