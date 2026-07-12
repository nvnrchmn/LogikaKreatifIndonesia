<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentHub\SubAccountController;
use App\Http\Controllers\Api\PaymentHub\InvoiceController;
use App\Http\Controllers\Api\PaymentHub\DisbursementController;

Route::prefix('payment-hub/v1')->middleware('saas.auth')->group(function () {
    Route::post('/sub-accounts', [SubAccountController::class, 'store']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::get('/invoices/{external_id}', [InvoiceController::class, 'show']);
    Route::post('/disbursements', [DisbursementController::class, 'store']);
});
