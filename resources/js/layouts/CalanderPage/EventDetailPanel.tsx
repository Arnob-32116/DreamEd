import { useRouter } from '@inertiajs/react';
import { CalendarEvent, URGENCY_CONFIG } from './calendar-types';

interface EventDetailPanelProps {
    event: CalendarEvent;
    onClose: () => void;
    onEdit: (event: CalendarEvent) => void;
    onDelete: (id: number) => void;
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function EventDetailPanel({ event, onClose, onEdit, onDelete }: EventDetailPanelProps) {
    const cfg = URGENCY_CONFIG[event.urgency];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
                {/* Color bar */}
                <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: event.color }} />

                <div className="px-6 py-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                    {cfg.label} Priority
                                </span>
                                {event.category && (
                                    <span
                                        className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                                        style={{ backgroundColor: event.category.color }}
                                    >
                                        {event.category.name}
                                    </span>
                                )}
                                {event.is_completed && (
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        ✓ Completed
                                    </span>
                                )}
                            </div>
                            <h2 className={`text-xl font-bold text-slate-800 ${event.is_completed ? 'line-through text-slate-400' : ''}`}>
                                {event.title}
                            </h2>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        {/* Time */}
                        <div className="flex items-start gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                {event.all_day ? (
                                    <p className="font-medium text-slate-700">
                                        All day · {new Date(event.start_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                ) : (
                                    <>
                                        <p className="font-medium text-slate-700">{formatDateTime(event.start_at)}</p>
                                        <p className="text-slate-400">→ {formatDateTime(event.end_at)}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        {event.location && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="font-medium text-slate-700">{event.location}</p>
                            </div>
                        )}

                        {/* Description */}
                        {event.description && (
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 leading-relaxed">{event.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6">
                        <button
                            onClick={() => onEdit(event)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(event.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
