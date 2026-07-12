<?php

namespace App\Http\Controllers\Api\PaymentHub;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\PaymentHub\PhSubAccount;
use App\Models\PaymentHub\PhDisbursement;
use Illuminate\Support\Facades\Log;

class DisbursementController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'external_id' => 'required|string|max:255',
            'external_reference_id' => 'required|string|max:255', // Which sub-account
            'amount' => 'required|numeric|min:10000',
            'bank_code' => 'required|string',
            'account_holder_name' => 'required|string',
            'account_number' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $saasApp = $request->saas_app;

        // Check duplicate
        $existing = PhDisbursement::where('saas_application_id', $saasApp->id)
            ->where('external_id', $request->external_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Disbursement external_id already exists',
                'data' => $existing
            ], 422);
        }

        // Find Sub-Account
        $subAccount = PhSubAccount::where('saas_application_id', $saasApp->id)
            ->where('external_reference_id', $request->external_reference_id)
            ->first();

        if (!$subAccount) {
            return response()->json(['message' => 'Sub-account not found'], 404);
        }

        $payload = [
            'external_id' => 'DISB-' . $saasApp->id . '-' . $request->external_id,
            'amount' => $request->amount,
            'bank_code' => $request->bank_code,
            'account_holder_name' => $request->account_holder_name,
            'account_number' => $request->account_number,
            'description' => $request->description ?? 'Penarikan Dana',
        ];

        $secretKey = \App\Models\Setting::get('xendit_secret_key', config('services.xendit.secret_key'));

        $response = Http::withBasicAuth($secretKey, '')
            ->withHeaders([
                'for-user-id' => $subAccount->xendit_account_id
            ])
            ->post('https://api.xendit.co/disbursements', $payload);

        if ($response->failed()) {
            Log::error('Xendit Disbursement Failed', ['response' => $response->json()]);
            return response()->json([
                'message' => 'Failed to create Xendit Disbursement. Ensure your Xendit Business Account is fully activated or in Test Mode.',
                'xendit_error' => $response->json()
            ], 422);
        }

        $xenditData = $response->json();

        $disbursement = PhDisbursement::create([
            'saas_application_id' => $saasApp->id,
            'ph_sub_account_id' => $subAccount->id,
            'external_id' => $request->external_id,
            'xendit_disbursement_id' => $xenditData['id'] ?? null,
            'amount' => $request->amount,
            'bank_code' => $request->bank_code,
            'account_holder_name' => $request->account_holder_name,
            'account_number' => $request->account_number,
            'status' => $xenditData['status'] ?? 'PENDING',
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Disbursement created successfully',
            'data' => $disbursement
        ], 201);
    }
}
