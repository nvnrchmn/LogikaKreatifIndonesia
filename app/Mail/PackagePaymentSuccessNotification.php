<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PackagePaymentSuccessNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public Transaction $transaction;

    public function __construct(Order $order, Transaction $transaction)
    {
        $this->order = $order;
        $this->transaction = $transaction;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[LUNAS] Pembayaran Berhasil — Pesanan ' . $this->order->order_number . ' Logikraf',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.package-payment-success',
        );
    }
}
