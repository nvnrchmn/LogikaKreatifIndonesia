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

            $transactionStatus = $payload['transaction_status'] ?? null;
            $orderId = $payload['order_id'] ?? null; // maps to transaction_reference
            
            if (!$transactionStatus || !$orderId) {
                return response()->json(['message' => 'Invalid payload'], 400);
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
