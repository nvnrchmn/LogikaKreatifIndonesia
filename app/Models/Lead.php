<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'service_category',
        'project_description',
        'estimated_pages',
        'target_launch',
        'budget_range',
        'lead_score',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'lead_score' => 'integer',
        ];
    }

    /**
     * Scoring otomatis berdasarkan budget range.
     */
    public static array $budgetScores = [
        'under_10m' => 10,
        '10m_25m' => 25,
        '25m_50m' => 50,
        '50m_100m' => 75,
        'above_100m' => 100,
    ];

    /**
     * Boot: auto-calculate lead score saat creating.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Lead $lead): void {
            $lead->lead_score = self::$budgetScores[$lead->budget_range] ?? 0;
        });
    }

    /**
     * Scope: new leads only.
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope: high priority leads (score >= 50).
     */
    public function scopeHighPriority($query)
    {
        return $query->where('lead_score', '>=', 50);
    }

    /**
     * Get human-readable budget label.
     */
    public function getBudgetLabelAttribute(): string
    {
        return match ($this->budget_range) {
            'under_10m' => 'Di bawah Rp 10 Juta',
            '10m_25m' => 'Rp 10 - 25 Juta',
            '25m_50m' => 'Rp 25 - 50 Juta',
            '50m_100m' => 'Rp 50 - 100 Juta',
            'above_100m' => 'Di atas Rp 100 Juta',
            default => '-',
        };
    }
}
