<?php

use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');


    // Blog
    Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
    Route::post('/blogs', [BlogController::class, 'store'])->name('blogs.store');
    Route::delete('/blogs/{blogPost}', [BlogController::class, 'destroy'])->name('blogs.destroy');
});

require __DIR__.'/settings.php';