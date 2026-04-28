import { CalendarEvent, URGENCY_CONFIG } from './calendar-types';

interface AgendaViewProps {
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(events: CalendarEvent[]) {
    const groups: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
        const key = new Date(ev.start_at).toDateString();
        if (!groups[key]) groups[key] = [];
        groups[key].push(ev);
    }
    return Object.entries(groups).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
}

export default function AgendaView({ events, onEventClick }: AgendaViewProps) {
    const grouped = groupByDate(events);
    const todayStr = new Date().toDateString();

    if (grouped.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No events this month</p>
                <p className="text-sm mt-1">Click "New Event" to create one</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-6">
            {grouped.map(([dateStr, dayEvents]) => {
                const isToday = dateStr === todayStr;
                return (
                    <div key={dateStr}>
                        {/* Date label */}
                        <div className="flex items-center gap-3 mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-1 z-10">
                            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl font-bold text-sm shrink-0 ${
                                isToday ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                                <span className="text-xs font-semibold">
                                    {new Date(dateStr).toLocaleDateString([], { weekday: 'short' })}
                                </span>
                                <span className="text-lg leading-tight">
                                    {new Date(dateStr).getDate()}
                                </span>
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                                    {isToday ? 'Today' : new Date(dateStr).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-xs text-slate-400">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        {/* Events */}
                        <div className="ml-16 space-y-2">
                            {dayEvents.map(event => {
                                const cfg = URGENCY_CONFIG[event.urgency];
                                return (
                                    <button
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className="w-full text-left bg-white rounded-xl border border-slate-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
                                        style={{ borderLeftColor: event.color, borderLeftWidth: 4 }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`
                                                        text-xs font-semibold px-2 py-0.5 rounded-full border
                                                        ${cfg.bg} ${cfg.color} ${cfg.border}
                                                    `}>
                                                        {cfg.label}
                                                    </span>
                                                    {event.category && (
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {event.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`font-semibold text-slate-800 truncate ${event.is_completed ? 'line-through text-slate-400' : ''}`}>
                                                    {event.title}
                                                </p>
                                                {event.description && (
                                                    <p className="text-sm text-slate-500 truncate mt-0.5">{event.description}</p>
                                                )}
                                                {event.location && (
                                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {event.location}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-semibold text-slate-600">
                                                    {event.all_day ? 'All day' : formatTime(event.start_at)}
                                                </p>
                                                {!event.all_day && (
                                                    <p className="text-xs text-slate-400">{formatTime(event.end_at)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
