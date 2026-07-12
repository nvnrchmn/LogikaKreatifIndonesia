<?php

namespace App\Http\Controllers\Api\PaymentHub;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\PaymentHub\PhSubAccount;

class SubAccountController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'external_reference_id' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'email' => 'required|email'
        ]);

        $saasApp = $request->saas_app;

        // Check if already exists
        $existing = PhSubAccount::where('saas_application_id', $saasApp->id)
            ->where('external_reference_id', $request->external_reference_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Sub-account already exists',
                'data' => $existing
            ], 200);
        }

        // Call Xendit API to create Sub-Account (xenPlatform)
        $response = Http::withBasicAuth(env('XENDIT_SECRET_KEY'), '')
            ->post('https://api.xendit.co/v2/accounts', [
                'email' => $request->email,
                'type' => 'OWNED',
                'business_profile' => [
                    'business_name' => $request->business_name
                ]
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'Failed to create Xendit Sub-Account',
                'xendit_error' => $response->json()
            ], 422);
        }

        $xenditData = $response->json();

        $subAccount = PhSubAccount::create([
            'saas_application_id' => $saasApp->id,
            'external_reference_id' => $request->external_reference_id,
            'xendit_account_id' => $xenditData['id'],
            'business_name' => $request->business_name,
            'status' => 'active'
        ]);

        return response()->json([
            'message' => 'Sub-Account created successfully',
            'data' => $subAccount
        ], 201);
    }
}
