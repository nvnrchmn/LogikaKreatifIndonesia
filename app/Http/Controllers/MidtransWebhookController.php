<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request)
    {
        try {
            $payload = $request->all();
            Log::info('Midtrans Webhook Received', $payload);

            $orderId = $payload['order_id'] ?? null;
            $statusCode = $payload['status_code'] ?? null;
            $grossAmount = $payload['gross_amount'] ?? null;
            $signatureKey = $payload['signature_key'] ?? null;
            $transactionStatus = $payload['transaction_status'] ?? null;

            if (!$orderId || !$statusCode || !$grossAmount || !$signatureKey) {
                return response()->json(['message' => 'Invalid payload'], 400);
            }

            // Verify signature: sha512(order_id + status_code + gross_amount + server_key)
            $serverKey = config('services.midtrans.server_key') ?: env('MIDTRANS_SERVER_KEY');
            $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

            if (!hash_equals($expectedSignature, $signatureKey)) {
                Log::warning('Midtrans Webhook: signature mismatch', ['order_id' => $orderId]);
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            $transaction = Transaction::where('transaction_reference', $orderId)->first();

            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                if ($transaction->status !== 'settlement') {
                    $transaction->update([
                        'status' => 'settlement',
                        'raw_gateway_response' => $payload,
                        'settled_at' => now(),
                    ]);

                    if ($transaction->order) {
                        $transaction->order->updateMilestoneStatus();
                    }
                }
            } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
                $transaction->update([
                    'status' => 'failed',
                    'raw_gateway_response' => $payload,
                ]);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Midtrans Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }
}
