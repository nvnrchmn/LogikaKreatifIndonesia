<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invoice extends Model
{
    protected $fillable = [
        'number',
        'type',
        'status',
        'client_id',
        'client_name',
        'client_email',
        'client_company',
        'subject',
        'notes',
        'items',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total',
        'issue_date',
        'due_date',
    ];

    protected $casts = [
        'items' => 'array',
        'issue_date' => 'date',
        'due_date' => 'date',
    ];

    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total, 0, ',', '.');
    }

    public function getFormattedSubtotalAttribute(): string
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }

    /**
     * Buat invoice baru dari quotation ini (convert).
     * Mengcopy semua field relevan, generate nomor invoice baru.
     */
    public function convertToInvoice(): Invoice
    {
        if ($this->type !== 'quotation') {
            throw new \RuntimeException('Hanya quotation yang bisa dikonversi.');
        }

        $prefix = 'INV';
        $number = $prefix . '-' . date('Ymd') . '-' . strtoupper(Str::random(4));

        return self::create([
            'number' => $number,
            'type' => 'invoice',
            'status' => 'draft',
            'client_id' => $this->client_id,
            'client_name' => $this->client_name,
            'client_email' => $this->client_email,
            'client_company' => $this->client_company,
            'subject' => $this->subject,
            'notes' => $this->notes,
            'items' => $this->items,
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'discount_amount' => $this->discount_amount,
            'total' => $this->total,
            'issue_date' => now()->toDateString(),
            'due_date' => $this->due_date,
        ]);
    }
}
