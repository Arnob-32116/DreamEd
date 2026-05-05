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

        return Inertia::render('blog', [
            'posts'      => $posts,
            'categories' => $this->getCategories(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'            => 'required|string|max:255',
            'excerpt'          => 'nullable|string|max:500',
            'content'          => 'required|string',
            'category'         => 'required|string',
            'cover_image'      => 'nullable|string',
            'cover_image_file' => 'nullable|image|max:5120',
        ]);

        $coverImagePath = null;

        // Priority 1: actual file upload (multipart)
        if ($request->hasFile('cover_image_file')) {
            $file           = $request->file('cover_image_file');
            $filename       = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $directory      = public_path('assets/BlogImages');
            if (!is_dir($directory)) mkdir($directory, 0755, true);
            $file->move($directory, $filename);
            $coverImagePath = '/assets/BlogImages/' . $filename;
        }
        // Priority 2: base64 data URL from modal drag-drop/file picker
        elseif ($request->filled('cover_image')) {
            $imageData = $request->input('cover_image');
            if (str_starts_with($imageData, 'data:image/')) {
                $coverImagePath = $this->saveBase64Image($imageData);
            } else {
                // Plain URL — store as-is
                $coverImagePath = $imageData;
            }
        }

        BlogPost::create([
            'title'        => $request->input('title'),
            'excerpt'      => $request->input('excerpt'),
            'content'      => $request->input('content'),
            'category'     => $request->input('category'),
            'cover_image'  => $coverImagePath,
            'user_id'      => Auth::id(),
            'status'       => 'published',
            'published_at' => now(),
        ]);

        return redirect()->route('blog.index')->with('success', 'Blog post created.');
    }

    public function destroy(BlogPost $blogPost)
    {
        if ($blogPost->user_id !== Auth::id()) {
            abort(403);
        }

        // Delete local image file if stored in assets/BlogImages
        if ($blogPost->cover_image && str_starts_with($blogPost->cover_image, '/assets/BlogImages/')) {
            $fullPath = public_path($blogPost->cover_image);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }

        BlogPost::destroy($blogPost->id);
        return back()->with('success', 'Blog post deleted.');
    }

    private function saveBase64Image(string $base64String): ?string
    {
        try {
            preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches);
            $extension = $matches[1] ?? 'jpg';
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $extension = 'jpg';
            }

            $imageData = base64_decode(
                preg_replace('/^data:image\/\w+;base64,/', '', $base64String)
            );

            if (!$imageData) return null;

            $filename  = time() . '_' . uniqid() . '.' . $extension;
            $directory = public_path('assets/BlogImages');

            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            file_put_contents($directory . '/' . $filename, $imageData);

            return '/assets/BlogImages/' . $filename;
        } catch (\Exception $e) {
            return null;
        }
    }

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
            'shares'       => $post->shares ?? 0,
            'views'        => $post->views ?? 0,
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
