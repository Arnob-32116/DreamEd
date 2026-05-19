<?php
// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE TO YOUR EXISTING web.php
// ─────────────────────────────────────────────────────────────────────────────

use App\Http\Controllers\ScholarshipController;

// ── Public routes (all authenticated users) ───────────────────────────────────
// Add inside your existing: Route::middleware(['auth', 'verified'])->group(...)

Route::get('/scholarships',        [ScholarshipController::class, 'index'])->name('scholarships.index');
Route::get('/scholarships/{slug}', [ScholarshipController::class, 'show'])->name('scholarships.show');

// ── Contributor routes ────────────────────────────────────────────────────────
// Add inside your existing: Route::middleware(['auth', 'verified', 'role:contributor,admin'])->group(...)

Route::prefix('contributor/scholarships')->name('contributor.scholarships.')->group(function () {
    Route::post('/',                      [ScholarshipController::class, 'store'])  ->name('store');
    Route::put('/{scholarship}',          [ScholarshipController::class, 'update']) ->name('update');
    Route::delete('/{scholarship}',       [ScholarshipController::class, 'destroy'])->name('destroy');
});
