<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogController extends Controller
{
    private string $supabaseUrl;
    private string $supabaseKey;
    private string $supabaseBucket;

    public function __construct()
    {
        $this->supabaseUrl    = rtrim(config('services.supabase.url', ''), '/');
        $this->supabaseKey    = config('services.supabase.service_role_key', '');
        $this->supabaseBucket = config('services.supabase.bucket', 'BlogImages');
    }

    // ── Blog listing ──────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $category = (string) $request->get('category', 'All');
        $search   = (string) $request->get('search', '');

        $query = BlogPost::where('status', 'published')
            ->with('user')
            ->orderByDesc('published_at');

        if (!empty($category) && $category !== 'All') {
            $query->where('category', $category);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title',   'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $posts = $query->get()->map(fn($post) => $this->formatPost($post));

        // IDs of posts that belong to the current user (used for "My Blogs" tab + delete button)
        $myPostIds = Auth::check()
            ? BlogPost::where('user_id', Auth::id())
                      ->where('status', 'published')
                      ->pluck('id')
                      ->toArray()
            : [];

        return Inertia::render('blog', [
            'posts'      => $posts,
            'categories' => $this->getCategories(),
            'myPostIds'  => $myPostIds,
        ]);
    }

    // ── Single post ───────────────────────────────────────────────────────────
    public function show(string $slug)
    {
        $post = BlogPost::with('user')
            ->where('status', 'published')
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)
                  ->orWhere('id', is_numeric($slug) ? (int) $slug : 0);
            })
            ->firstOrFail();

        $post->increment('views');

        $related = BlogPost::with('user')
            ->where('status', 'published')
            ->where('category', $post->category)
            ->where('id', '!=', $post->id)
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn($p) => $this->formatPost($p));

        return Inertia::render('BlogShow', [
            'post'         => $this->formatPost($post),
            'relatedPosts' => $related,
            'isOwner'      => Auth::check() && Auth::id() === $post->user_id,
        ]);
    }

    // ── Create post ───────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'title'            => 'required|string|max:255',
            'excerpt'          => 'nullable|string|max:500',
            'content'          => 'required|string',
            'category'         => 'required|string|in:Study Abroad,Student Life,Career,Programs,Side Hustle,Visa Guide,Education,Scholarship',
            'cover_image_file' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'cover_image_url'  => 'nullable|string|url',
        ]);

        $coverImageUrl = null;

        if ($request->hasFile('cover_image_file')) {
            $coverImageUrl = $this->uploadToSupabase($request->file('cover_image_file'));
        } elseif ($request->filled('cover_image_url')) {
            $coverImageUrl = $request->input('cover_image_url');
        }

        BlogPost::create([
            'title'        => $request->input('title'),
            'excerpt'      => $request->input('excerpt') ?: null,
            'content'      => $request->input('content'),
            'category'     => $request->input('category'),
            'cover_image'  => $coverImageUrl,
            'user_id'      => Auth::id(),
            'status'       => 'published',
            'published_at' => now(),
        ]);

        return redirect()->route('blog.index')->with('success', 'Blog post created.');
    }

    // ── Delete post ───────────────────────────────────────────────────────────
    public function destroy(BlogPost $blogPost)
    {
        if ($blogPost->user_id !== Auth::id()) {
            abort(403);
        }

        if ($blogPost->cover_image && $this->isSupabaseUrl($blogPost->cover_image)) {
            $this->deleteFromSupabase($blogPost->cover_image);
        }

        $blogPost->delete();

        return back()->with('success', 'Blog post deleted.');
    }

    // ── Supabase helpers ──────────────────────────────────────────────────────

    private function uploadToSupabase(\Illuminate\Http\UploadedFile $file): ?string
    {
        if (empty($this->supabaseUrl) || empty($this->supabaseKey)) {
            Log::error('Supabase config missing — check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
            return null;
        }

        try {
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $path      = 'posts/' . time() . '_' . Str::random(10) . '.' . $extension;
            $endpoint  = "{$this->supabaseUrl}/storage/v1/object/{$this->supabaseBucket}/{$path}";
            $mimeType  = $file->getMimeType() ?: 'image/jpeg';

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type'  => $mimeType,
                'x-upsert'      => 'true',
            ])->withBody(file_get_contents($file->getRealPath()), $mimeType)->post($endpoint);

            if ($response->failed()) {
                Log::error('Supabase upload failed', [
                    'status'   => $response->status(),
                    'body'     => $response->body(),
                    'endpoint' => $endpoint,
                ]);
                return null;
            }

            return "{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}/{$path}";

        } catch (\Exception $e) {
            Log::error('Supabase upload exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    private function deleteFromSupabase(string $publicUrl): void
    {
        try {
            $prefix = "{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}/";
            if (!str_starts_with($publicUrl, $prefix)) return;

            $objectPath = substr($publicUrl, strlen($prefix));

            Http::withHeaders([
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type'  => 'application/json',
            ])->delete(
                "{$this->supabaseUrl}/storage/v1/object/{$this->supabaseBucket}",
                ['prefixes' => [$objectPath]]
            );
        } catch (\Exception $e) {
            Log::error('Supabase delete exception', ['message' => $e->getMessage()]);
        }
    }

    private function isSupabaseUrl(string $url): bool
    {
        return !empty($this->supabaseUrl) &&
               str_starts_with($url, "{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}");
    }

    // ── Formatters ────────────────────────────────────────────────────────────

    private function formatPost(BlogPost $post): array
    {
        return [
            'id'           => $post->id,
            'title'        => $post->title,
            'slug'         => $post->slug,
            'excerpt'      => $post->excerpt ?? '',
            'content'      => $post->content,
            'category'     => $post->category,
            'cover_image'  => $post->cover_image,
            'status'       => $post->status,
            'shares'       => $post->shares  ?? 0,
            'views'        => $post->views   ?? 0,
            'readTime'     => $post->read_time,
            'author'       => $post->user->name ?? 'Unknown',
            'authorAvatar' => $post->author_avatar,
            'date'         => $post->published_at?->format('M d, Y')
                              ?? $post->created_at->format('M d, Y'),
            'imageColor'   => null,
        ];
    }

    private function getCategories(): array
    {
        return [
            'All', 'Study Abroad', 'Student Life', 'Career',
            'Programs', 'Side Hustle', 'Visa Guide', 'Education', 'Scholarship',
        ];
    }
}