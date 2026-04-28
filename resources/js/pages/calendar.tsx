import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CalendarEvent, EventCategory } from '@/layouts/CalanderPage/calendar-types';
import CalendarHeader from '@/layouts/CalanderPage/CalendarHeader';
import MonthGrid from '@/layouts/CalanderPage/MonthGrid';
import AgendaView from '@/layouts/CalanderPage/AgendaView';
import EventModal from '@/layouts/CalanderPage/EventModal';
import EventDetailPanel from '@/layouts/CalanderPage/EventDetailPanel';
import MiniCalendar from '@/layouts/CalanderPage/MiniCalendar';

type View = 'month' | 'week' | 'day' | 'agenda';

interface CalendarPageProps {
    events: CalendarEvent[];
    categories: EventCategory[];
    year: number;
    month: number;
}

export default function CalendarIndex({ events, categories, year, month }: CalendarPageProps) {
    const [view, setView] = useState<View>('month');
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
    const [defaultDate, setDefaultDate] = useState<Date | undefined>();
    const [urgencyFilter, setUrgencyFilter] = useState<string[]>([]);

    const filteredEvents = urgencyFilter.length === 0
        ? events
        : events.filter(e => urgencyFilter.includes(e.urgency));

    function goToMonth(newYear: number, newMonth: number) {
        router.get(
            '/calendar',
            { year: newYear, month: newMonth },
            { preserveState: false, preserveScroll: false }
        );
    }

    function goPrev() {
        if (month === 1) goToMonth(year - 1, 12);
        else goToMonth(year, month - 1);
    }

    function goNext() {
        if (month === 12) goToMonth(year + 1, 1);
        else goToMonth(year, month + 1);
    }

    function goToday() {
        const now = new Date();
        goToMonth(now.getFullYear(), now.getMonth() + 1);
    }

    function handleDayClick(date: Date) {
        setDefaultDate(date);
        setEditingEvent(null);
        setShowModal(true);
    }

    function handleEventClick(event: CalendarEvent) {
        setDetailEvent(event);
    }

    function handleEdit(event: CalendarEvent) {
        setDetailEvent(null);
        setEditingEvent(event);
        setShowModal(true);
    }

    function handleDelete(id: number) {
        if (!confirm('Delete this event?')) return;
        router.delete(`/events/${id}`, {
            onSuccess: () => setDetailEvent(null),
        });
    }

    function toggleUrgency(u: string) {
        setUrgencyFilter(prev =>
            prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]
        );
    }

    const urgencySummary = [
        { key: 'critical', label: 'Critical', dot: 'bg-red-500',    text: 'text-red-600'     },
        { key: 'high',     label: 'High',     dot: 'bg-orange-400',  text: 'text-orange-600'  },
        { key: 'medium',   label: 'Medium',   dot: 'bg-amber-400',   text: 'text-amber-600'   },
        { key: 'low',      label: 'Low',      dot: 'bg-emerald-400', text: 'text-emerald-600' },
    ];

    const upcomingEvents = [...events]
        .filter(e => new Date(e.start_at) >= new Date())
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
        .slice(0, 5);

    return (
        <>
            <Head title="Calendar" />

            <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 p-4 gap-5 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-1 mb-1">
                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-bold text-slate-800 text-base">Calendar</span>
                    </div>

                    {/* Add event button */}
                    <button
                        onClick={() => { setEditingEvent(null); setDefaultDate(undefined); setShowModal(true); }}
                        className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Event
                    </button>

                    {/* Mini calendar */}
                    <MiniCalendar
                        year={year}
                        month={month}
                        events={events}
                        onDateSelect={handleDayClick}
                        onMonthChange={goToMonth}
                    />

                    {/* Urgency filter */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            Filter by Urgency
                        </p>
                        <div className="flex flex-col gap-1">
                            {urgencySummary.map(u => {
                                const count = events.filter(e => e.urgency === u.key).length;
                                const active = urgencyFilter.includes(u.key);
                                return (
                                    <button
                                        key={u.key}
                                        onClick={() => toggleUrgency(u.key)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                            active ? 'bg-slate-100' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full ${u.dot}`} />
                                        <span className={`flex-1 text-left ${u.text}`}>{u.label}</span>
                                        <span className="text-xs text-slate-400 font-semibold">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {urgencyFilter.length > 0 && (
                            <button
                                onClick={() => setUrgencyFilter([])}
                                className="mt-2 w-full text-xs text-indigo-500 hover:text-indigo-700 font-medium py-1"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>

                    {/* Upcoming events */}
                    {upcomingEvents.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                                Upcoming
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {upcomingEvents.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => setDetailEvent(e)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left w-full"
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: e.color }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{e.title}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(e.start_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <CalendarHeader
                        year={year}
                        month={month}
                        view={view}
                        onViewChange={setView}
                        onPrev={goPrev}
                        onNext={goNext}
                        onToday={goToday}
                        onAddEvent={() => { setEditingEvent(null); setDefaultDate(undefined); setShowModal(true); }}
                    />

                    {view === 'month' && (
                        <MonthGrid
                            year={year}
                            month={month}
                            events={filteredEvents}
                            onDayClick={handleDayClick}
                            onEventClick={handleEventClick}
                        />
                    )}

                    {(view === 'week' || view === 'day') && (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            <p className="text-sm">Week / Day view coming soon</p>
                        </div>
                    )}

                    {view === 'agenda' && (
                        <AgendaView
                            events={filteredEvents}
                            onEventClick={handleEventClick}
                        />
                    )}
                </div>
            </div>

            {/* Event create/edit modal */}
            {showModal && (
                <EventModal
                    event={editingEvent}
                    defaultDate={defaultDate}
                    categories={categories}
                    onClose={() => { setShowModal(false); setEditingEvent(null); }}
                />
            )}

            {/* Event detail panel */}
            {detailEvent && (
                <EventDetailPanel
                    event={detailEvent}
                    onClose={() => setDetailEvent(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}
