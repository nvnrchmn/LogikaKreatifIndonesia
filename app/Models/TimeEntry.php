<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    protected $fillable = [
        'order_id',
        'order_task_id',
        'user_id',
        'description',
        'minutes',
        'worked_date',
    ];

    protected $casts = [
        'worked_date' => 'date',
        'minutes' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(OrderTask::class, 'order_task_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedDurationAttribute(): string
    {
        $h = intdiv($this->minutes, 60);
        $m = $this->minutes % 60;
        return $h > 0 ? "{$h}j {$m}m" : "{$m}m";
    }
}
