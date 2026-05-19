<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class University extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by',
        'name',
        'abbreviation',
        'slug',
        'logo',
        'cover_image',
        'website',
        'city',
        'state',
        'country',
        'country_code',
        'category',
        'qs_ranking',
        'acceptance_rate',
        'student_count',
        'faculty_count',
        'founded_year',
        'president',
        'motto',
        'about',
        'life_in_city',
        'is_published',
    ];

    protected $casts = [
        'acceptance_rate' => 'decimal:2',
        'is_published'    => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (University $university) {
            if (empty($university->slug)) {
                $university->slug = Str::slug($university->name) . '-' . Str::random(5);
            }
        });
    }

    public function contributor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function programs(): HasMany
    {
        return $this->hasMany(UniversityProgram::class);
    }

    public function scholarships(): HasMany
    {
        return $this->hasMany(UniversityScholarship::class);
    }

    public function expenses(): HasOne
    {
        return $this->hasOne(UniversityExpense::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByCountry($query, string $code)
    {
        return $query->where('country_code', $code);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // Helpers
    public function getFormattedAcceptanceRateAttribute(): string
    {
        return $this->acceptance_rate ? $this->acceptance_rate . '%' : 'N/A';
    }

    public function getFormattedRankingAttribute(): string
    {
        return $this->qs_ranking ? '#' . $this->qs_ranking . ' QS Ranking' : 'Unranked';
    }
}
