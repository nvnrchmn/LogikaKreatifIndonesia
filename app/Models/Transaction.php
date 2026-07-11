<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'transaction_reference',
        'milestone_name',
        'payment_method',
        'amount',
        'status',
        'payment_url',
        'raw_gateway_response',
        'settled_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'raw_gateway_response' => 'array',
            'settled_at' => 'datetime',
        ];
    }

    /**
     * Get the order that owns the transaction.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if transaction is settled/paid.
     */
    public function isSettled(): bool
    {
        return $this->status === 'settlement';
    }

    /**
     * Get formatted amount as Rupiah.
     */
    public function getFormattedAmountAttribute(): string
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    /**
     * Get human-readable milestone label.
     */
    public function getMilestoneLabelAttribute(): string
    {
        return match ($this->milestone_name) {
            'dp_kickoff' => 'Down Payment (Kickoff)',
            'development' => 'Milestone Development',
            'uat_launch' => 'UAT & Peluncuran',
            default => $this->milestone_name ?? '-',
        };
    }
}
