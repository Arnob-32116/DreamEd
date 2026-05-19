<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Scholarship extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by',
        'name',
        'slug',
        'institution',
        'logo',
        'cover_image',
        'website',
        'country',
        'country_code',
        'type',
        'coverage_type',
        'currency',
        'monthly_amount',
        'tuition_coverage',
        'travel_allowance',
        'living_allowance',
        'duration',
        'recipients',
        'description',
        'subject_areas',
        'is_published',
    ];

    protected $casts = [
        'subject_areas'    => 'array',
        'monthly_amount'   => 'decimal:2',
        'tuition_coverage' => 'decimal:2',
        'travel_allowance' => 'decimal:2',
        'living_allowance' => 'decimal:2',
        'recipients'       => 'integer',
        'is_published'     => 'boolean',
    ];

    // ── Auto-generate slug on create ──────────────────────────────────────────
    protected static function booted(): void
    {
        static::creating(function (Scholarship $s) {
            if (empty($s->slug)) {
                $base = Str::slug($s->name);
                $slug = $base . '-' . Str::random(5);
                // Ensure uniqueness
                while (static::withTrashed()->where('slug', $slug)->exists()) {
                    $slug = $base . '-' . Str::random(5);
                }
                $s->slug = $slug;
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCountry($query, string $countryCode)
    {
        return $query->where('country_code', $countryCode);
    }

    public function scopeByInstitution($query, string $institution)
    {
        return $query->where('institution', $institution);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Returns the currency symbol for display.
     * e.g. "EUR" → "€", "USD" → "$", "GBP" → "£"
     */
    public function getCurrencySymbolAttribute(): string
    {
        return match (strtoupper($this->currency ?? 'USD')) {
            'EUR'   => '€',
            'GBP'   => '£',
            'CAD'   => 'CA$',
            'AUD'   => 'AU$',
            'CHF'   => 'CHF ',
            default => '$',
        };
    }

    /**
     * Formatted monthly amount with symbol.
     * e.g. "€2,000/month"
     */
    public function getFormattedMonthlyAmountAttribute(): ?string
    {
        if ($this->monthly_amount === null) return null;
        return $this->currency_symbol . number_format($this->monthly_amount) . '/month';
    }

    /**
     * Subject areas guaranteed to be an array (never null).
     */
    public function getSubjectAreasArrayAttribute(): array
    {
        return $this->subject_areas ?? [];
    }
}
