<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $year  = $request->integer('year', now()->year);
        $month = $request->integer('month', now()->month);

        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth()->startOfWeek();
        $end   = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfWeek();

        $events = Event::forUser(Auth::id())
            ->inRange($start, $end)
            ->with('category')
            ->orderBy('start_at')
            ->get()
            ->map(fn($e) => $this->formatEvent($e));

       $categories = EventCategory::query()
    ->where('user_id', Auth::id())
    ->get();
        return Inertia::render('calendar', [
            'events'     => $events,
            'categories' => $categories,
            'year'       => $year,
            'month'      => $month,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'location'       => 'nullable|string|max:255',
            'start_at'       => 'required|date',
            'end_at'         => 'required|date|after_or_equal:start_at',
            'all_day'        => 'boolean',
            'urgency'        => 'required|in:low,medium,high,critical',
            'color'          => 'nullable|string|max:7',
            'category_id'    => 'nullable|exists:event_categories,id',
            'recurrence'     => 'nullable|in:none,daily,weekly,monthly,yearly',
            'recurrence_end' => 'nullable|date',
            'reminders'      => 'nullable|array',
            'attendees'      => 'nullable|array',
        ]);

        $event = Event::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Event created.');
    }

    public function update(Request $request, Event $event)
    {
    if ($event->user_id !== Auth::id()) {
        abort(403);
    }

    $validated = $request->validate([
        'title'          => 'sometimes|required|string|max:255',
        'description'    => 'nullable|string',
        'location'       => 'nullable|string|max:255',
        'start_at'       => 'sometimes|required|date',
        'end_at'         => 'sometimes|required|date|after_or_equal:start_at',
        'all_day'        => 'boolean',
        'urgency'        => 'sometimes|in:low,medium,high,critical',
        'color'          => 'nullable|string|max:7',
        'category_id'    => 'nullable|exists:event_categories,id',
        'recurrence'     => 'nullable|in:none,daily,weekly,monthly,yearly',
        'recurrence_end' => 'nullable|date',
        'is_completed'   => 'boolean',
        'reminders'      => 'nullable|array',
        'attendees'      => 'nullable|array',
    ]);

    $event->update($validated);

    return back()->with('success', 'Event updated.');
    }

   
   public function destroy(Event $event)
{
    if ($event->user_id !== Auth::id()) {
        abort(403);
    }

    $event->forceDelete(); // if using SoftDeletes
    // OR
    Event::destroy($event->id); // alternative
    
    return back()->with('success', 'Event deleted.');
}



    private function formatEvent(Event $event): array
    {
        return [
            'id'           => $event->id,
            'title'        => $event->title,
            'description'  => $event->description,
            'location'     => $event->location,
            'start_at'     => $event->start_at->toIso8601String(),
            'end_at'       => $event->end_at->toIso8601String(),
            'all_day'      => $event->all_day,
            'urgency'      => $event->urgency,
            'urgencyColor' => $event->urgency_color,
            'color'        => $event->color,
            'is_completed' => $event->is_completed,
            'category'     => $event->category?->only('id', 'name', 'color'),
        ];
    }
}

