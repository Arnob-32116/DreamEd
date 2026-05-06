<?php

use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Blog listing — renders resources/js/pages/blog.tsx
    Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');

    // Single post — renders resources/js/pages/BlogShow.tsx
    // URL uses /blogs/{slug} (plural) to avoid collision with the listing route
    Route::get('/blogs/{slug}', [BlogController::class, 'show'])->name('blogs.show');

    Route::post('/blogs', [BlogController::class, 'store'])->name('blogs.store');
    Route::delete('/blogs/{blogPost}', [BlogController::class, 'destroy'])->name('blogs.destroy');
});

require __DIR__.'/settings.php';
