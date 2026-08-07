<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VisitorLog extends Model
{
    protected $fillable = [
        'ip',
        'method',
        'path',
        'route_name',
        'user_agent',
        'referer',
        'is_bot',
        'visited_at',
    ];

    protected $casts = [
        'is_bot' => 'boolean',
        'visited_at' => 'datetime',
    ];

    public function user(): MorphTo
    {
        return $this->morphTo();
    }
}
