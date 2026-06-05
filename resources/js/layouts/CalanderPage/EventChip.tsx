import { CalendarEvent, URGENCY_CONFIG } from './calendar-types';

interface EventChipProps {
    event: CalendarEvent;
    onClick: (e: CalendarEvent) => void;
    compact?: boolean;
}

const urgencyDot: Record<string, string> = {
    low:      'bg-emerald-400',
    medium:   'bg-amber-400',
    high:     'bg-orange-400',
    critical: 'bg-red-500 animate-pulse',
};

export default function EventChip({ event, onClick, compact = false }: EventChipProps) {
    const startTime = new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <button
            onClick={() => onClick(event)}
            className={`
                group w-full text-left rounded-md px-2 transition-all hover:opacity-90 hover:shadow-sm
                ${compact ? 'py-0.5' : 'py-1'}
                ${event.is_completed ? 'opacity-50' : ''}
            `}
            style={{ backgroundColor: event.color + '22', borderLeft: `3px solid ${event.color}` }}
            title={event.title}
        >
            <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgencyDot[event.urgency]}`} />
                {!event.all_day && !compact && (
                    <span className="text-[10px] font-medium text-slate-500 shrink-0">{startTime}</span>
                )}
                <span
                    className={`text-xs font-semibold truncate ${event.is_completed ? 'line-through' : ''}`}
                    style={{ color: event.color }}
                >
                    {event.title}
                </span>
            </div>
        </button>
    );
}
