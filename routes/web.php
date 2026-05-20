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

    Route::get('/scholarships',        [ScholarshipController::class, 'index'])->name('scholarships.index');
    Route::get('/scholarships/{slug}', [ScholarshipController::class, 'show'])->name('scholarships.show');
});


// 3. Students only
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    // Student only routes here
});


// 4. Contributors only
Route::middleware(['auth', 'verified', 'role:contributor'])->group(function () {
    // Contributor only routes here
});


// 5. Contributors and Admins
Route::middleware(['auth', 'verified', 'role:contributor,admin'])
    ->prefix('contributor/scholarships')
    ->name('contributor.scholarships.')
    ->group(function () {
        Route::get('/',                          [ScholarshipController::class, 'myIndex'])->name('index');   // GET /contributor/scholarships
        Route::get('/create',                    [ScholarshipController::class, 'create']) ->name('create');  // GET /contributor/scholarships/create
        Route::post('/',                         [ScholarshipController::class, 'store'])  ->name('store');   // POST /contributor/scholarships
        Route::get('/{scholarship}/edit',        [ScholarshipController::class, 'edit'])   ->name('edit');    // GET /contributor/scholarships/{id}/edit
        Route::put('/{scholarship}',             [ScholarshipController::class, 'update']) ->name('update');  // PUT /contributor/scholarships/{id}
        Route::delete('/{scholarship}',          [ScholarshipController::class, 'destroy'])->name('destroy'); // DELETE /contributor/scholarships/{id}
    });


// 6. Admins only
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Admin only routes here
});


require __DIR__.'/settings.php';