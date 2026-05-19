<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\UniversityController;

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