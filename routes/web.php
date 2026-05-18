<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// All authenticated users
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Students only
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    // Student only routes will be added here when merging branches
});

// Contributors only
Route::middleware(['auth', 'verified', 'role:contributor'])->group(function () {
    // Contributor only routes will be added here when merging branches
});

// Contributors and admins (shared elevated access)
Route::middleware(['auth', 'verified', 'role:contributor,admin'])->group(function () {
    // Shared contributor + admin routes will be added here when merging branches
});

// Admins only
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Admin only routes will be added here when merging branches
});

require __DIR__.'/settings.php';