<?php
// Add these routes to your routes/web.php

use App\Http\Controllers\EventController;

// Calendar page
Route::get('/calendar', [EventController::class, 'index'])
    ->name('calendar.index')
    ->middleware('auth');

// Event CRUD
Route::middleware('auth')->group(function () {
    Route::post('/events',           [EventController::class, 'store'])  ->name('events.store');
    Route::put('/events/{event}',    [EventController::class, 'update']) ->name('events.update');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
});
