<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\PaymentGatewayInterface;
use App\Services\Payment\MidtransGateway;
use App\Services\Payment\XenditGateway;
use Illuminate\Support\ServiceProvider;

class PaymentServiceProvider extends ServiceProvider
{
    /**
     * Register the payment gateway binding.
     */
    public function register(): void
    {
        $this->app->singleton(PaymentGatewayInterface::class, function ($app) {
            try {
                $driver = \App\Models\Setting::get('payment_gateway_driver', 'xendit');
            } catch (\Exception $e) {
                $driver = 'xendit';
            }

            return match ($driver) {
                'xendit' => new XenditGateway(),
                'midtrans' => new MidtransGateway(),
                default => throw new \InvalidArgumentException("Payment driver [{$driver}] tidak didukung."),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
