<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ScholarshipController;

// 1. Completely Public Route (Welcome page)
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');


// 2. All Authenticated Users
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // ── Public routes (Moved INSIDE auth middleware) ─────────────────────────
    Route::get('/scholarships',        [ScholarshipController::class, 'index'])->name('scholarships.index');
    Route::get('/scholarships/{slug}', [ScholarshipController::class, 'show'])->name('scholarships.show');
});


// 3. Students only
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    // Student only routes will be added here when merging branches
});


// 4. Contributors only
Route::middleware(['auth', 'verified', 'role:contributor'])->group(function () {
    // Contributor only routes will be added here when merging branches
});


// 5. Contributors and Admins (Shared elevated access)
Route::middleware(['auth', 'verified', 'role:contributor,admin'])->group(function () {
    
    // ── Contributor routes (Moved INSIDE contributor,admin middleware) ───────
    Route::prefix('contributor/scholarships')->name('contributor.scholarships.')->group(function () {
        Route::post('/',               [ScholarshipController::class, 'store'])  ->name('store');
        Route::put('/{scholarship}',   [ScholarshipController::class, 'update']) ->name('update');
        Route::delete('/{scholarship}', [ScholarshipController::class, 'destroy'])->name('destroy');
    });
});


// 6. Admins only
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Admin only routes will be added here when merging branches
});


require __DIR__.'/settings.php';