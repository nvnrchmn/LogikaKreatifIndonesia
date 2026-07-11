<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    public function handle(Request $request)
    {
        try {
            $payload = $request->all();
            Log::info('Xendit Webhook Received', $payload);
            
            // Xendit callback token for security
            $xenditToken = $request->header('x-callback-token');
            if ($xenditToken !== env('XENDIT_CALLBACK_TOKEN')) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $orderId = $payload['external_id'] ?? null;
            $status = $payload['status'] ?? null;

            if (!$orderId || !$status) {
                return response()->json(['message' => 'Invalid payload'], 400);
            }

            $transaction = Transaction::where('transaction_reference', $orderId)->first();
            
            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            if ($status === 'PAID' || $status === 'SETTLED') {
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
            } elseif ($status === 'EXPIRED') {
                $transaction->update([
                    'status' => 'failed',
                    'raw_gateway_response' => $payload,
                ]);
            }

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            Log::error('Xendit Webhook Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }
}
