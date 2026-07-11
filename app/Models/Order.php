<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'service_id',
        'project_name',
        'project_brief',
        'total_amount',
        'status',
        'milestone_status',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
        ];
    }

    /**
     * Boot: auto-generate order number (LK-YYYYMMDD-XXXX).
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Order $order): void {
            if (empty($order->order_number)) {
                $prefix = config('payment.invoice_prefix', 'LK');
                $date = now()->format('Ymd');
                $sequence = str_pad(
                    (string) (self::whereDate('created_at', today())->count() + 1),
                    4,
                    '0',
                    STR_PAD_LEFT
                );
                $order->order_number = "{$prefix}-{$date}-{$sequence}";
            }
        });
    }

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the service for this order.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the transactions for this order.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the files for this order.
     */
    public function files(): HasMany
    {
        return $this->hasMany(OrderFile::class);
    }

    /**
     * Get the comments for this order.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(OrderComment::class);
    }

    /**
     * Get formatted total amount as Rupiah.
     */
    public function getFormattedAmountAttribute(): string
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }

    /**
     * Update milestone status based on transactions.
     */
    public function updateMilestoneStatus(): void
    {
        $transactions = $this->transactions()->orderBy('id', 'asc')->get();
        if ($transactions->isEmpty()) {
            return;
        }

        $allSettled = $transactions->every(fn ($trx) => $trx->status === 'settlement');
        if ($allSettled) {
            $this->update(['status' => 'completed', 'milestone_status' => 'fully_paid']);
            return;
        }

        // Logic based on index
        $settledCount = $transactions->filter(fn ($trx) => $trx->status === 'settlement')->count();
        if ($settledCount === 1) {
            $this->update(['status' => 'in_progress', 'milestone_status' => 'development']);
        } elseif ($settledCount === 2) {
            $this->update(['status' => 'in_progress', 'milestone_status' => 'uat']);
        } else {
            $this->update(['milestone_status' => 'dp_pending']);
        }
    }
}
