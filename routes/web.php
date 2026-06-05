<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\UniversityController;
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Students only
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    // Calendar
    Route::get('/calendar', [EventController::class, 'index'])->name('calendar.index');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');

    // Blog
    Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
    Route::get('/blogs/{slug}', [BlogController::class, 'show'])->name('blogs.show');
    Route::post('/blogs', [BlogController::class, 'store'])->name('blogs.store');
    Route::delete('/blogs/{blogPost}', [BlogController::class, 'destroy'])->name('blogs.destroy');
});

// Contributors only
Route::middleware(['auth', 'verified', 'role:contributor'])->group(function () {
    // Contributor only routes
});

// Contributors and admins
Route::middleware(['auth', 'verified', 'role:contributor,admin'])->group(function () {
    // Contributor + admin routes
});

// Admins only
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Admin only routes
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/universities', [UniversityController::class, 'index'])->name('universities.index');
    Route::get('/universities/{slug}', [UniversityController::class, 'show'])->name('universities.show');
});

// ── Contributors + Admins: manage universities ───────────────────────────────
Route::middleware(['auth', 'verified', 'role:contributor,admin'])->group(function () {

    // My submitted universities
    Route::get('/contributor/universities', [UniversityController::class, 'myUniversities'])->name('contributor.universities.index');

    // Create university
    Route::get('/contributor/universities/create', [UniversityController::class, 'create'])->name('contributor.universities.create');
    Route::post('/contributor/universities', [UniversityController::class, 'store'])->name('contributor.universities.store');

    // Edit university (basic info + expenses)
    Route::get('/contributor/universities/{slug}/edit', [UniversityController::class, 'edit'])->name('contributor.universities.edit');
    Route::put('/contributor/universities/{slug}', [UniversityController::class, 'update'])->name('contributor.universities.update');

    // Programs
    Route::post('/contributor/universities/{slug}/programs', [UniversityController::class, 'storeProgram'])->name('contributor.universities.programs.store');
    Route::put('/contributor/universities/{slug}/programs/{program}', [UniversityController::class, 'updateProgram'])->name('contributor.universities.programs.update');
    Route::delete('/contributor/universities/{slug}/programs/{program}', [UniversityController::class, 'destroyProgram'])->name('contributor.universities.programs.destroy');

    // Scholarships
    Route::post('/contributor/universities/{slug}/scholarships', [UniversityController::class, 'storeScholarship'])->name('contributor.universities.scholarships.store');
    Route::put('/contributor/universities/{slug}/scholarships/{scholarship}', [UniversityController::class, 'updateScholarship'])->name('contributor.universities.scholarships.update');
    Route::delete('/contributor/universities/{slug}/scholarships/{scholarship}', [UniversityController::class, 'destroyScholarship'])->name('contributor.universities.scholarships.destroy');
});

require __DIR__.'/settings.php';