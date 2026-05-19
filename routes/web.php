<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UniversityController;

// Public/Authenticated Standard Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/universities', [UniversityController::class, 'index'])->name('universities.index');
    Route::get('/universities/{slug}', [UniversityController::class, 'show'])->name('universities.show');
});

// ── Contributors + Admins: manage universities ───────────────────────────────
Route::middleware(['auth', 'verified', 'role:contributor,admin'])
    ->prefix('contributor/universities')
    ->name('contributor.universities.')
    ->group(function () {

        // My submitted universities
        Route::get('/', [UniversityController::class, 'myUniversities'])->name('index');

        // Create university
        Route::get('/create', [UniversityController::class, 'create'])->name('create');
        Route::post('/', [UniversityController::class, 'store'])->name('store');

        // Edit university (basic info + expenses)
        Route::get('/{slug}/edit', [UniversityController::class, 'edit'])->name('edit');
        Route::put('/{slug}', [UniversityController::class, 'update'])->name('update');

        // Programs
        Route::post('/{slug}/programs', [UniversityController::class, 'storeProgram'])->name('programs.store');
        Route::put('/{slug}/programs/{program}', [UniversityController::class, 'updateProgram'])->name('programs.update');
        Route::delete('/{slug}/programs/{program}', [UniversityController::class, 'destroyProgram'])->name('programs.destroy');

        // Scholarships
        Route::post('/{slug}/scholarships', [UniversityController::class, 'storeScholarship'])->name('scholarships.store');
        Route::put('/{slug}/scholarships/{scholarship}', [UniversityController::class, 'updateScholarship'])->name('scholarships.update');
        Route::delete('/{slug}/scholarships/{scholarship}', [UniversityController::class, 'destroyScholarship'])->name('scholarships.destroy');
    });

require __DIR__.'/settings.php';