<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniversityProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'name',
        'school',
        'degree_type',
        'duration',
        'tuition_fee',
        'application_deadline',
        'program_url',
        'required_qualifications',
        'subjects',
    ];

    protected $casts = [
        'tuition_fee'          => 'decimal:2',
        'application_deadline' => 'date',
        'subjects'             => 'array',
    ];

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }
}
