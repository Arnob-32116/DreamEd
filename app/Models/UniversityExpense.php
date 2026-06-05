<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniversityExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'annual_tuition',
        'room_and_board',
        'application_fee',
        'books_supplies',
        'transportation',
        'personal_expenses',
        'health_insurance',
        'financial_aid_note',
        'financial_aid_url',
    ];

    protected $casts = [
        'annual_tuition'    => 'decimal:2',
        'room_and_board'    => 'decimal:2',
        'application_fee'   => 'decimal:2',
        'books_supplies'    => 'decimal:2',
        'transportation'    => 'decimal:2',
        'personal_expenses' => 'decimal:2',
        'health_insurance'  => 'decimal:2',
    ];

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function getTotalEstimatedCostAttribute(): float
    {
        return (float) (
            ($this->annual_tuition    ?? 0) +
            ($this->room_and_board    ?? 0) +
            ($this->application_fee   ?? 0) +
            ($this->books_supplies    ?? 0) +
            ($this->transportation    ?? 0) +
            ($this->personal_expenses ?? 0) +
            ($this->health_insurance  ?? 0)
        );
    }
}
