<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniversityScholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'name',
        'type',
        'coverage',
        'is_independent',
        'description',
        'total_amount',
        'recipients',
        'eligible_countries',
        'programs_covered',
        'scholarship_url',
    ];

    protected $casts = [
        'total_amount'   => 'decimal:2',
        'is_independent' => 'boolean',
    ];

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }
}
