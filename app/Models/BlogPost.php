<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'category',
        'cover_image',
        'status',
        'shares',
        'views',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'shares'       => 'integer',
        'views'        => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (BlogPost $post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title) . '-' . Str::random(5);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scope — note: no return type hint to avoid IDE issues
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // Accessor — Laravel 9+ style
    public function getReadTimeAttribute(): string
    {
        $words   = str_word_count(strip_tags((string) ($this->content ?? '')));
        $minutes = max(1, (int) ceil($words / 200));
        return "{$minutes} min read";
    }

    public function getAuthorAvatarAttribute(): string
    {
        $name  = $this->user?->name ?? 'Unknown';
        $parts = explode(' ', $name);
        return strtoupper(
            substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : '')
        );
    }
}
