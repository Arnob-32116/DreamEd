<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\UniversityController;
use App\Http\Controllers\UniversitySearchController;
use App\Http\Controllers\ScholarshipController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

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

    // Universities — AI search MUST be before {slug}
   // Universities — AI search MUST be before {slug}
    Route::get('/universities', [UniversitySearchController::class, 'index'])->name('universities.index');
    Route::post('/universities/ai-search', [UniversitySearchController::class, 'aiSearch'])->name('universities.ai-search');
    Route::get('/universities/{slug}', [UniversityController::class, 'show'])->name('universities.show');
    // Scholarships (student view)
    Route::get('/scholarships', [ScholarshipController::class, 'index'])->name('scholarships.index');
    Route::get('/scholarships/{slug}', [ScholarshipController::class, 'show'])->name('scholarships.show');
});

// Contributors only
Route::middleware(['auth', 'verified', 'role:contributor'])->group(function () {
    // Contributor only routes
});

// Contributors and admins
Route::middleware(['auth', 'verified', 'role:contributor,admin'])->group(function () {

    // Universities
    Route::get('/contributor/universities', [UniversityController::class, 'myUniversities'])->name('contributor.universities.index');
    Route::get('/contributor/universities/create', [UniversityController::class, 'create'])->name('contributor.universities.create');
    Route::post('/contributor/universities', [UniversityController::class, 'store'])->name('contributor.universities.store');
    Route::get('/contributor/universities/{slug}/edit', [UniversityController::class, 'edit'])->name('contributor.universities.edit');
    Route::put('/contributor/universities/{slug}', [UniversityController::class, 'update'])->name('contributor.universities.update');
    Route::post('/contributor/universities/{slug}/programs', [UniversityController::class, 'storeProgram'])->name('contributor.universities.programs.store');
    Route::put('/contributor/universities/{slug}/programs/{program}', [UniversityController::class, 'updateProgram'])->name('contributor.universities.programs.update');
    Route::delete('/contributor/universities/{slug}/programs/{program}', [UniversityController::class, 'destroyProgram'])->name('contributor.universities.programs.destroy');
    Route::post('/contributor/universities/{slug}/scholarships', [UniversityController::class, 'storeScholarship'])->name('contributor.universities.scholarships.store');
    Route::put('/contributor/universities/{slug}/scholarships/{scholarship}', [UniversityController::class, 'updateScholarship'])->name('contributor.universities.scholarships.update');
    Route::delete('/contributor/universities/{slug}/scholarships/{scholarship}', [UniversityController::class, 'destroyScholarship'])->name('contributor.universities.scholarships.destroy');

    // Scholarships
    Route::prefix('contributor/scholarships')->name('contributor.scholarships.')->group(function () {
        Route::get('/', [ScholarshipController::class, 'myIndex'])->name('index');
        Route::get('/create', [ScholarshipController::class, 'create'])->name('create');
        Route::post('/', [ScholarshipController::class, 'store'])->name('store');
        Route::get('/{scholarship}/edit', [ScholarshipController::class, 'edit'])->name('edit');
        Route::put('/{scholarship}', [ScholarshipController::class, 'update'])->name('update');
        Route::delete('/{scholarship}', [ScholarshipController::class, 'destroy'])->name('destroy');
    });
});

// Admins only
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Admin only routes
});

require __DIR__.'/settings.php';