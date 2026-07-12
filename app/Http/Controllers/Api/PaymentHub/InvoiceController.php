<?php

namespace App\Http\Controllers\Api\PaymentHub;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\PaymentHub\PhSubAccount;
use App\Models\PaymentHub\PhTransaction;
use Illuminate\Support\Facades\Log;

class InvoiceController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'external_id' => 'required|string|max:255',
            'external_reference_id' => 'required|string|max:255', // Which sub-account
            'amount' => 'required|numeric|min:1000',
            'platform_fee_amount' => 'required|numeric|min:0',
            'payer_email' => 'required|email',
            'description' => 'required|string|max:255',
        ]);

        $saasApp = $request->saas_app;

        // Check if transaction already exists to prevent duplicate
        $existingTx = PhTransaction::where('saas_application_id', $saasApp->id)
            ->where('external_id', $request->external_id)
            ->first();

        if ($existingTx) {
            return response()->json([
                'message' => 'Transaction external_id already exists',
                'data' => $existingTx
            ], 422);
        }

        // Find Sub-Account
        $subAccount = PhSubAccount::where('saas_application_id', $saasApp->id)
            ->where('external_reference_id', $request->external_reference_id)
            ->first();

        if (!$subAccount) {
            return response()->json(['message' => 'Sub-account not found'], 404);
        }

        // Prepare Xendit Payload
        $payload = [
            'external_id' => 'PHUB-' . $saasApp->id . '-' . $request->external_id,
            'amount' => $request->amount,
            'payer_email' => $request->payer_email,
            'description' => $request->description,
        ];

        // Apply Platform Fee dynamically if > 0
        if ($request->platform_fee_amount > 0) {
            $payload['fees'] = [
                [
                    'type' => 'Platform Fee',
                    'value' => (int) $request->platform_fee_amount
                ]
            ];
        }

        // Call Xendit API WITH for-user-id header
        $secretKey = \App\Models\Setting::get('xendit_secret_key', config('services.xendit.secret_key'));

        $response = Http::withBasicAuth($secretKey, '')
            ->withHeaders([
                'for-user-id' => $subAccount->xendit_account_id
            ])
            ->post('https://api.xendit.co/v2/invoices', $payload);

        if ($response->failed()) {
            Log::error('Xendit Invoice Failed', ['response' => $response->json()]);
            return response()->json([
                'message' => 'Failed to create Xendit Invoice',
                'xendit_error' => $response->json()
            ], 422);
        }

        $xenditData = $response->json();

        // Record Transaction
        $transaction = PhTransaction::create([
            'saas_application_id' => $saasApp->id,
            'ph_sub_account_id' => $subAccount->id,
            'external_id' => $request->external_id,
            'xendit_invoice_id' => $xenditData['id'],
            'invoice_url' => $xenditData['invoice_url'],
            'amount' => $request->amount,
            'platform_fee_amount' => $request->platform_fee_amount,
            'status' => 'PENDING',
        ]);

        return response()->json([
            'message' => 'Invoice created successfully',
            'data' => [
                'transaction' => $transaction,
                'checkout_url' => $transaction->invoice_url
            ]
        ], 201);
    }

    public function show(Request $request, $external_id)
    {
        $saasApp = $request->saas_app;

        $transaction = PhTransaction::where('saas_application_id', $saasApp->id)
            ->where('external_id', $external_id)
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json([
            'message' => 'Success',
            'data' => $transaction
        ]);
    }
}
