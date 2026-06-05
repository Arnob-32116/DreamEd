import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CalendarEvent, EventCategory, URGENCY_CONFIG } from '@/layouts/CalanderPage/calendar-types';
import CalendarHeader from '@/layouts/CalanderPage/CalendarHeader';
import MonthGrid from '@/layouts/CalanderPage/MonthGrid';
import AgendaView from '@/layouts/CalanderPage/AgendaView';
import EventModal from '@/layouts/CalanderPage/EventModal';
import EventDetailPanel from '@/layouts/CalanderPage/EventDetailPanel';

type View = 'month' | 'agenda';

interface CalendarPageProps {
    events: CalendarEvent[];
    categories: EventCategory[];
    year: number;
    month: number;
}

// ── Custom Delete Confirmation Modal ─────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-foreground">Delete Event</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Are you sure you want to delete this event? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl bg-destructive hover:opacity-90 text-white text-sm font-semibold transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Upcoming Agenda Panel ─────────────────────────────────────────────────────
function UpcomingAgendaPanel({ events, onEventClick }: { events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
    const upcoming = [...events]
        .filter(e => new Date(e.start_at) >= new Date())
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
        .slice(0, 3);

    return (
        <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Upcoming
            </p>
            {upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">No upcoming events</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {upcoming.map(e => {
                        const cfg = URGENCY_CONFIG[e.urgency];
                        const dateStr = new Date(e.start_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                        const timeStr = e.all_day
                            ? 'All day'
                            : new Date(e.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <button
                                key={e.id}
                                onClick={() => onEventClick(e)}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-left w-full border border-border"
                            >
                                <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{e.title}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{dateStr} · {timeStr}</p>
                                    <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Main Calendar Page ────────────────────────────────────────────────────────
export default function CalendarIndex({ events, categories, year, month }: CalendarPageProps) {
    const [view, setView]                     = useState<View>('month');
    const [showModal, setShowModal]           = useState(false);
    const [editingEvent, setEditingEvent]     = useState<CalendarEvent | null>(null);
    const [detailEvent, setDetailEvent]       = useState<CalendarEvent | null>(null);
    const [defaultDate, setDefaultDate]       = useState<Date | undefined>();
    const [urgencyFilter, setUrgencyFilter]   = useState<string[]>([]);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const filteredEvents = urgencyFilter.length === 0
        ? events
        : events.filter(e => urgencyFilter.includes(e.urgency));

    function goToMonth(newYear: number, newMonth: number) {
        router.get('/calendar', { year: newYear, month: newMonth }, { preserveState: false, preserveScroll: false });
    }
    function goPrev()  { month === 1  ? goToMonth(year - 1, 12) : goToMonth(year, month - 1); }
    function goNext()  { month === 12 ? goToMonth(year + 1, 1)  : goToMonth(year, month + 1); }
    function goToday() { const n = new Date(); goToMonth(n.getFullYear(), n.getMonth() + 1); }

    function handleDayClick(date: Date)             { setDefaultDate(date); setEditingEvent(null); setShowModal(true); }
    function handleEventClick(event: CalendarEvent) { setDetailEvent(event); }
    function handleEdit(event: CalendarEvent)       { setDetailEvent(null); setEditingEvent(event); setShowModal(true); }
    function handleDelete(id: number)               { setDeleteTargetId(id); }

    function confirmDelete() {
        if (deleteTargetId === null) return;
        router.delete(`/events/${deleteTargetId}`, {
            onSuccess: () => { setDetailEvent(null); setDeleteTargetId(null); },
        });
    }

    function toggleUrgency(u: string) {
        setUrgencyFilter(prev => prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]);
    }

    const urgencySummary = [
        { key: 'critical', label: 'Critical', dot: 'bg-red-500',     text: 'text-red-600'     },
        { key: 'high',     label: 'High',     dot: 'bg-orange-400',  text: 'text-orange-600'  },
        { key: 'medium',   label: 'Medium',   dot: 'bg-amber-400',   text: 'text-amber-600'   },
        { key: 'low',      label: 'Low',      dot: 'bg-emerald-400', text: 'text-emerald-600' },
    ];

    return (
        <>
            <Head title="Calendar" />

            {/* No bg set here — inherits transparently from the kit's layout */}
            <div className="flex h-full min-h-screen">

                {/* ── Calendar Sidebar ─────────────────────────────────────
                    No bg-* class → fully transparent, blends with kit sidebar.
                    Only a right border to separate it from the main grid.     */}
                <aside className="hidden lg:flex flex-col w-64 border-r border-border p-4 gap-5 overflow-y-auto">

                    <button
                        onClick={() => { setEditingEvent(null); setDefaultDate(undefined); setShowModal(true); }}
                        className="flex items-center justify-center gap-2 w-full bg-primary hover:opacity-90 text-primary-foreground py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Event
                    </button>

                    <UpcomingAgendaPanel events={events} onEventClick={handleEventClick} />

                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                            Filter by Urgency
                        </p>
                        <div className="flex flex-col gap-1">
                            {urgencySummary.map(u => {
                                const count  = events.filter(e => e.urgency === u.key).length;
                                const active = urgencyFilter.includes(u.key);
                                return (
                                    <button
                                        key={u.key}
                                        onClick={() => toggleUrgency(u.key)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                            active ? 'bg-accent' : 'hover:bg-accent'
                                        }`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full ${u.dot}`} />
                                        <span className={`flex-1 text-left ${u.text}`}>{u.label}</span>
                                        <span className="text-xs text-muted-foreground font-semibold">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {urgencyFilter.length > 0 && (
                            <button
                                onClick={() => setUrgencyFilter([])}
                                className="mt-2 w-full text-xs text-primary hover:opacity-70 font-medium py-1"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>
                </aside>

                {/* ── Main content ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <CalendarHeader
                        year={year} month={month} view={view}
                        onViewChange={setView} onPrev={goPrev} onNext={goNext}
                        onToday={goToday}
                        onAddEvent={() => { setEditingEvent(null); setDefaultDate(undefined); setShowModal(true); }}
                    />

                    {view === 'month' && (
                        <MonthGrid
                            year={year} month={month} events={filteredEvents}
                            onDayClick={handleDayClick} onEventClick={handleEventClick}
                        />
                    )}

                    {view === 'agenda' && (
                        <AgendaView events={filteredEvents} onEventClick={handleEventClick} />
                    )}
                </div>
            </div>

            {showModal && (
                <EventModal
                    event={editingEvent} defaultDate={defaultDate} categories={categories}
                    onClose={() => { setShowModal(false); setEditingEvent(null); }}
                />
            )}

            {detailEvent && (
                <EventDetailPanel
                    event={detailEvent} onClose={() => setDetailEvent(null)}
                    onEdit={handleEdit} onDelete={handleDelete}
                />
            )}

            {deleteTargetId !== null && (
                <DeleteConfirmModal onConfirm={confirmDelete} onCancel={() => setDeleteTargetId(null)} />
            )}
        </>
    );
}
