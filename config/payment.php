<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway Driver
    |--------------------------------------------------------------------------
    |
    | Driver pembayaran yang digunakan secara default. Bisa diganti hanya
    | dengan mengubah variabel PAYMENT_GATEWAY_DRIVER di file .env
    | tanpa perlu mengubah kode pada Controller utama.
    |
    | Supported: "xendit", "midtrans", "tripay"
    |
    */

    'default_driver' => env('PAYMENT_GATEWAY_DRIVER', 'xendit'),

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Credentials
    |--------------------------------------------------------------------------
    */

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'public_key' => env('XENDIT_PUBLIC_KEY'),
        'webhook_token' => env('XENDIT_WEBHOOK_VERIFICATION_TOKEN'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    ],

    'tripay' => [
        'api_key' => env('TRIPAY_API_KEY'),
        'private_key' => env('TRIPAY_PRIVATE_KEY'),
        'merchant_code' => env('TRIPAY_MERCHANT_CODE'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Invoice Configuration
    |--------------------------------------------------------------------------
    */

    'invoice_prefix' => 'LK',

    /*
    |--------------------------------------------------------------------------
    | Milestone Billing Default Splits
    |--------------------------------------------------------------------------
    |
    | Konfigurasi default pembagian termin pembayaran proyek.
    | Format: [nama_milestone => persentase]
    |
    */

    'milestone_splits' => [
        'dp_kickoff' => 30,
        'development' => 40,
        'uat_launch' => 30,
    ],

];
