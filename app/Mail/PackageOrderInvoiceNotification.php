<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PackageOrderInvoiceNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public Transaction $transaction;
    public bool $isNewUser;

    public function __construct(Order $order, Transaction $transaction, bool $isNewUser = false)
    {
        $this->order = $order;
        $this->transaction = $transaction;
        $this->isNewUser = $isNewUser;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice Pembayaran & Konfirmasi Pesanan ' . $this->order->order_number . ' — Logikraf',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.package-order-invoice',
        );
    }
}
