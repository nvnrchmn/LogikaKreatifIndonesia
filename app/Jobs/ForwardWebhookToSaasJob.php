<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\PaymentHub\PhTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ForwardWebhookToSaasJob implements ShouldQueue
{
    use Queueable;

    public $transaction;
    public $payload;

    /**
     * Create a new job instance.
     */
    public function __construct(PhTransaction $transaction, array $payload)
    {
        $this->transaction = $transaction;
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $saasApp = $this->transaction->saasApplication;

        if (!$saasApp || empty($saasApp->webhook_url)) {
            return;
        }

        // Calculate HMAC signature for security so SaaS knows it's from Logikraf
        $signature = hash_hmac('sha256', json_encode($this->payload), $saasApp->api_key);

        $response = Http::withHeaders([
            'X-Logikraf-Signature' => $signature,
            'Content-Type' => 'application/json'
        ])->post($saasApp->webhook_url, $this->payload);

        if ($response->successful()) {
            $this->transaction->update(['forwarded_to_webhook' => true]);
        } else {
            Log::warning('Failed to forward webhook to SaaS App: ' . $saasApp->name, [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            
            // Re-throw to trigger job retry
            throw new \Exception("Webhook forwarding failed with status " . $response->status());
        }
    }
}
