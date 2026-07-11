<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Transaction;
use App\Models\User;
use Exception;
use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;

class XenditGateway implements PaymentGatewayInterface
{
    public function generatePaymentToken(Transaction $transaction, User $customer)
    {
        $secretKey = \App\Models\Setting::get('xendit_secret_key', config('services.xendit.secret_key'));
        Configuration::setXenditKey($secretKey);

        $apiInstance = new InvoiceApi();
        
        $createInvoiceRequest = new CreateInvoiceRequest([
            'external_id' => $transaction->transaction_reference,
            'amount' => $transaction->amount,
            'payer_email' => $customer->email,
            'description' => 'Invoice: ' . $transaction->milestone_name,
            'customer' => [
                'given_names' => $customer->name,
                'email' => $customer->email,
            ],
            'success_redirect_url' => route('client.orders.show', $transaction->order_id),
            'failure_redirect_url' => route('client.orders.show', $transaction->order_id),
        ]);

        try {
            $result = $apiInstance->createInvoice($createInvoiceRequest);
            return [
                'driver' => 'xendit',
                'invoice_url' => $result['invoice_url']
            ];
        } catch (Exception $e) {
            throw new Exception('Xendit Error: ' . $e->getMessage());
        }
    }
}
