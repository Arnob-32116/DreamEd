<?php

use App\Http\Controllers\EventController;
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

require __DIR__.'/settings.php';