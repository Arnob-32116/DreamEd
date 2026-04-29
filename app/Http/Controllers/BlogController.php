<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->string('category', 'All');
        $search   = $request->string('search', '');

        $query = BlogPost::published()
            ->with('user')
            ->orderByDesc('published_at');

        if ($category && $category !== 'All') {
            $query->byCategory($category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title',   'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $posts = $query->get()->map(fn($post) => $this->formatPost($post));

        return Inertia::render('blog', [
            'posts'      => $posts,
            'categories' => $this->getCategories(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'excerpt'     => 'nullable|string|max:500',
            'content'     => 'required|string',
            'category'    => 'required|string',
            'cover_image' => 'nullable|string',
            'status'      => 'nullable|in:draft,published',
        ]);

        $status = $validated['status'] ?? 'published';

        BlogPost::create([
            ...$validated,
            'user_id'      => Auth::id(),
            'status'       => $status,
            'published_at' => $status === 'published' ? now() : null,
        ]);

        return redirect()->route('blog.index')->with('success', 'Blog post created.');
    }

    public function destroy(BlogPost $blogPost)
{
    if ($blogPost->user_id !== Auth::id()) {
        abort(403);
    }

    BlogPost::destroy($blogPost->id); // ← use this instead
    return back()->with('success', 'Blog post deleted.');
}

    private function formatPost(BlogPost $post): array
    {
        return [
            'id'           => $post->id,
            'title'        => $post->title,
            'slug'         => $post->slug,
            'excerpt'      => $post->excerpt,
            'content'      => $post->content,
            'category'     => $post->category,
            'cover_image'  => $post->cover_image,
            'status'       => $post->status,
            'shares'       => $post->shares,
            'views'        => $post->views,
            'readTime'     => $post->read_time,
            'author'       => $post->user->name ?? 'Unknown',
            'authorAvatar' => $post->author_avatar,
            'date'         => $post->published_at?->format('M d, Y') ?? $post->created_at->format('M d, Y'),
            'imageColor'   => null,
        ];
    }

    private function getCategories(): array
    {
        return ['All', 'Study Abroad', 'Student Life', 'Career', 'Programs', 'Side Hustle', 'Visa Guide', 'Education', 'Scholarship'];
    }
}
