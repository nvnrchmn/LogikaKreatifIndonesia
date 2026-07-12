<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\PaymentHub\PhTransaction;
use App\Jobs\ForwardWebhookToSaasJob;
use Illuminate\Support\Str;

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

            // Check if this is a Payment Hub Transaction
            if (Str::startsWith($orderId, 'PHUB-')) {
                // Format: PHUB-{saasAppId}-{external_id}
                $parts = explode('-', $orderId, 3);
                
                if (count($parts) === 3) {
                    $saasAppId = $parts[1];
                    $externalId = $parts[2];
                    
                    $phTx = PhTransaction::where('saas_application_id', $saasAppId)
                        ->where('external_id', $externalId)
                        ->first();
                        
                    if ($phTx) {
                        if ($status === 'PAID' || $status === 'SETTLED') {
                            $phTx->update(['status' => 'PAID', 'paid_at' => now(), 'payment_method' => $payload['payment_method'] ?? null]);
                        } elseif ($status === 'EXPIRED') {
                            $phTx->update(['status' => 'EXPIRED']);
                        }
                        
                        // Dispatch Job to forward webhook to SaaS App
                        ForwardWebhookToSaasJob::dispatch($phTx, $payload);
                        
                        return response()->json(['message' => 'Payment Hub Webhook Processed']);
                    }
                }
            }

            // Fallback to old Transaction logic
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
