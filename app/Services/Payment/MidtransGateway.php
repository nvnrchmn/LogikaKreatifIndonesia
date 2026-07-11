<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Transaction;
use App\Models\User;
use Exception;

class MidtransGateway implements PaymentGatewayInterface
{
    public function generatePaymentToken(Transaction $transaction, User $customer)
    {
        // Ensure Midtrans configuration is set
        \Midtrans\Config::$serverKey = \App\Models\Setting::get('midtrans_server_key', config('services.midtrans.server_key'));
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
        \Midtrans\Config::$isSanitized = config('services.midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = config('services.midtrans.is_3ds');

        $params = [
            'transaction_details' => [
                'order_id' => $transaction->transaction_reference,
                'gross_amount' => $transaction->amount,
            ],
            'customer_details' => [
                'first_name' => $customer->name,
                'email' => $customer->email,
            ],
            'item_details' => [
                [
                    'id' => $transaction->id,
                    'price' => $transaction->amount,
                    'quantity' => 1,
                    'name' => 'Invoice: ' . $transaction->milestone_name,
                ]
            ]
        ];

        try {
            return [
                'driver' => 'midtrans',
                'token' => \Midtrans\Snap::getSnapToken($params)
            ];
        } catch (Exception $e) {
            throw new Exception('Midtrans Error: ' . $e->getMessage());
        }
    }
}
