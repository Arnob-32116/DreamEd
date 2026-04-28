<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'location',
        'start_at',
        'end_at',
        'all_day',
        'urgency',
        'color',
        'recurrence',
        'recurrence_end',
        'is_completed',
        'reminders',
        'attendees',
    ];

    protected $casts = [
        'start_at'       => 'datetime',
        'end_at'         => 'datetime',
        'recurrence_end' => 'date',
        'all_day'        => 'boolean',
        'is_completed'   => 'boolean',
        'reminders'      => 'array',
        'attendees'      => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class);
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeInRange($query, $start, $end)
    {
        return $query->whereBetween('start_at', [$start, $end]);
    }

    public function scopeByUrgency($query, $urgency)
    {
        return $query->where('urgency', $urgency);
    }

    public function getUrgencyColorAttribute(): string
    {
        return match ($this->urgency) {
            'low'      => '#22c55e',
            'medium'   => '#f59e0b',
            'high'     => '#f97316',
            'critical' => '#ef4444',
            default    => '#6366f1',
        };
    }
}
